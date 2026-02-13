import { createContext, useState, useEffect, useCallback, useRef } from "react";

export const StockContext = createContext();

const API_KEY = "MDWGB788T4MAHP1H";
const REQUEST_DELAY_MS = 15000;
const FALLBACK_PRICE = 289.05;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function StockProvider({ children }) {
  const [stocks, setStocks] = useState([]);
  const [formError, setFormError] = useState("");

  // Cache of symbols we have confirmed are VALID (from a real quote response)
  const validSymbolsRef = useRef(new Set());

  const stocksRef = useRef([]);
  useEffect(() => {
    stocksRef.current = stocks;
  }, [stocks]);

  const queueRunningRef = useRef(false);

  const fetchOne = useCallback(async (stock) => {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
        stock.symbol
      )}&apikey=${encodeURIComponent(API_KEY)}`;

      const res = await fetch(url);
      const data = await res.json();

      const msg =
        data?.Information || data?.Note || data?.["Error Message"] || null;

      // API limit/server message: fallback demo price
      if (msg) {
        const currentPrice = FALLBACK_PRICE;
        const profitLoss = (currentPrice - stock.price) * stock.quantity;

        return {
          ...stock,
          currentPrice,
          profitLoss,
          apiError: msg,
          usedFallback: true,
          invalidSymbol: false,
        };
      }

      const priceStr = data?.["Global Quote"]?.["05. price"];

      // If no price, treat as invalid and STOP retrying
      if (!priceStr) {
        return {
          ...stock,
          currentPrice: null,
          profitLoss: null,
          apiError: "Invalid stock symbol (no quote returned)",
          usedFallback: false,
          invalidSymbol: true,
        };
      }

      const currentPrice = parseFloat(priceStr);
      const profitLoss = (currentPrice - stock.price) * stock.quantity;

      return {
        ...stock,
        currentPrice,
        profitLoss,
        apiError: null,
        usedFallback: false,
        invalidSymbol: false,
      };
    } catch {
      // Network error: fallback
      const currentPrice = FALLBACK_PRICE;
      const profitLoss = (currentPrice - stock.price) * stock.quantity;

      return {
        ...stock,
        currentPrice,
        profitLoss,
        apiError: "Network error (fallback used)",
        usedFallback: true,
        invalidSymbol: false,
      };
    }
  }, []);

  const runQueue = useCallback(async () => {
    if (queueRunningRef.current) return;
    queueRunningRef.current = true;

    try {
      while (true) {
        const list = stocksRef.current;

        const next = list.find(
          (s) => s.currentPrice === null && !s.isLoading && !s.invalidSymbol
        );
        if (!next) break;

        setStocks((prev) =>
          prev.map((s) => (s.id === next.id ? { ...s, isLoading: true } : s))
        );

        const updated = await fetchOne(next);

        setStocks((prev) =>
          prev.map((s) =>
            s.id === updated.id ? { ...updated, isLoading: false } : s
          )
        );

        await sleep(REQUEST_DELAY_MS);
      }
    } finally {
      queueRunningRef.current = false;
    }
  }, [fetchOne]);

  useEffect(() => {
    const needsFetch = stocks.some(
      (s) => s.currentPrice === null && !s.isLoading && !s.invalidSymbol
    );
    if (needsFetch) runQueue();
  }, [stocks, runQueue]);

  // ✅ Validate BEFORE adding
  const validateSymbol = useCallback(async (symbol) => {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
        symbol
      )}&apikey=${encodeURIComponent(API_KEY)}`;

      const res = await fetch(url);
      const data = await res.json();

      const msg =
        data?.Information || data?.Note || data?.["Error Message"] || null;

      // 🔒 If rate-limited, we CANNOT validate new symbols reliably.
      // Only allow if symbol was previously validated as real.
      if (msg) {
        if (validSymbolsRef.current.has(symbol)) {
          return { ok: true, reason: "rate_limited_but_known_valid" };
        }
        return {
          ok: false,
          error:
            "API limit reached — cannot validate new stock symbols right now. Try again later.",
        };
      }

      const priceStr = data?.["Global Quote"]?.["05. price"];

      // Invalid symbol -> block
      if (!priceStr) {
        return { ok: false, error: `Invalid stock symbol: ${symbol}` };
      }

      // Valid -> cache it
      validSymbolsRef.current.add(symbol);
      return { ok: true, reason: "validated" };
    } catch {
      // Network error: also cannot validate new symbols safely
      if (validSymbolsRef.current.has(symbol)) {
        return { ok: true, reason: "network_error_but_known_valid" };
      }
      return {
        ok: false,
        error: "Network error — cannot validate symbol. Please try again.",
      };
    }
  }, []);

  const addStock = useCallback(
    async (stock) => {
      setFormError("");

      const symbol = stock.symbol?.trim().toUpperCase();
      if (!symbol) {
        setFormError("Please enter a stock symbol.");
        return { ok: false };
      }

      if (!/^[A-Z0-9.\-]{1,10}$/.test(symbol)) {
        setFormError(`Invalid stock symbol format: ${symbol}`);
        return { ok: false };
      }

      const v = await validateSymbol(symbol);
      if (!v.ok) {
        setFormError(v.error);
        return { ok: false };
      }

      const newItem = {
        id: crypto.randomUUID(),
        symbol,
        quantity: stock.quantity,
        price: stock.price,
        currentPrice: null,
        profitLoss: null,
        apiError: null,
        usedFallback: false,
        isLoading: false,
        invalidSymbol: false,
      };

      setStocks((prev) => {
        const next = [...prev, newItem];
        stocksRef.current = next;
        return next;
      });

      runQueue();
      return { ok: true };
    },
    [runQueue, validateSymbol]
  );

  return (
    <StockContext.Provider value={{ stocks, addStock, formError }}>
      {children}
    </StockContext.Provider>
  );
}
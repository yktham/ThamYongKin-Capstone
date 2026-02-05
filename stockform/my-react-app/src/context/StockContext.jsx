import { createContext, useState, useEffect, useCallback, useRef } from "react";

export const StockContext = createContext();

const API_KEY = "MDWGB788T4MAHP1H";
const REQUEST_DELAY_MS = 15000; // safe spacing (free tier)
const FALLBACK_PRICE = 289.05; // demo fallback when API quota is hit

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function StockProvider({ children }) {
  const [stocks, setStocks] = useState([]);

  // Always-up-to-date list for the queue to read
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

      // ✅ If API is limited/blocked, use fallback demo price (still calculate P/L)
      if (msg) {
        const currentPrice = FALLBACK_PRICE;
        const profitLoss =
          (currentPrice - stock.price) * stock.quantity;

        return {
          ...stock,
          currentPrice,
          profitLoss,
          apiError: msg, // keep message for transparency
          usedFallback: true,
        };
      }

      const priceStr = data?.["Global Quote"]?.["05. price"];
      const currentPrice = priceStr ? parseFloat(priceStr) : null;

      const profitLoss =
        currentPrice !== null
          ? (currentPrice - stock.price) * stock.quantity
          : null;

      return {
        ...stock,
        currentPrice,
        profitLoss,
        apiError: null,
        usedFallback: false,
      };
    } catch {
      // ✅ Network error: also fallback so UI still shows numbers
      const currentPrice = FALLBACK_PRICE;
      const profitLoss = (currentPrice - stock.price) * stock.quantity;

      return {
        ...stock,
        currentPrice,
        profitLoss,
        apiError: "Network error (fallback used)",
        usedFallback: true,
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
          (s) => s.currentPrice === null && !s.isLoading
        );
        if (!next) break;

        // mark loading
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
    const needsFetch = stocks.some((s) => s.currentPrice === null && !s.isLoading);
    if (needsFetch) runQueue();
  }, [stocks, runQueue]);

  const addStock = (stock) => {
    const newItem = {
      id: crypto.randomUUID(),
      ...stock,
      currentPrice: null,
      profitLoss: null,
      apiError: null,
      usedFallback: false,
      isLoading: false,
    };

    setStocks((prev) => {
      const next = [...prev, newItem];
      stocksRef.current = next; // keep ref in sync immediately
      return next;
    });

    runQueue(); // start immediately
  };

  return (
    <StockContext.Provider value={{ stocks, addStock }}>
      {children}
    </StockContext.Provider>
  );
}
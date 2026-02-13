export default function StockList({ stocks }) {
  if (!stocks || stocks.length === 0) {
    return <p className="emptyText">No stocks added yet.</p>;
  }

  return (
    <div className="stockList">
      {stocks.map((s, i) => {
        const key = s.id ?? `${s.symbol}-${i}`;

        const currentPriceText =
          s.currentPrice !== null
            ? Number(s.currentPrice).toFixed(2)
            : s.isLoading
            ? "Loading..."
            : "Queued...";

        const profitLossText =
          s.profitLoss !== null
            ? `${s.profitLoss >= 0 ? "+" : ""}${Number(s.profitLoss).toFixed(2)}`
            : s.isLoading
            ? "Loading..."
            : "Queued...";

        const plClass =
          s.profitLoss === null ? "" : s.profitLoss >= 0 ? "profit" : "loss";

        return (
          <div key={key} className="stockCard">
            <div className="symbolLine">Symbol: {s.symbol}</div>
            <div>Quantity: {s.quantity}</div>
            <div>Purchase Price: {Number(s.price).toFixed(2)}</div>

            <div>
              Current Price: {currentPriceText}
              {s.usedFallback ? " (demo)" : ""}
            </div>

            <div className={plClass}>Profit/Loss: {profitLossText}</div>

            {s.usedFallback && (
              <div style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
                API limit reached today — showing demo price.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
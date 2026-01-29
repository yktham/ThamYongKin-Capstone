import { useState } from "react";
import StockForm from "./components/StockForm";

export default function App() {
  const [stocks, setStocks] = useState([]);

  const addStock = (stock) => {
    setStocks((prev) => [...prev, stock]);
  };

  return (
  <div className="container">
    <h1 className="title">Finance Dashboard</h1>

    <StockForm onAddStock={addStock} />

    <h2 className="sectionTitle">Stock List</h2>

    {stocks.length === 0 ? (
      <p className="emptyText">No stocks added yet.</p>
    ) : (
      <ul>
        {stocks.map((stock, index) => (
          <li key={index} className="stockItem">
            {stock.symbol} — {stock.quantity} @ ${stock.price}
          </li>
        ))}
      </ul>
    )}
  </div>
);
}
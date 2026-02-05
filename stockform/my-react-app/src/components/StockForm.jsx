import { useState, useContext } from "react";
import { StockContext } from "../context/StockContext";

export default function StockForm() {
  const { addStock } = useContext(StockContext);

  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!symbol || !quantity || !price) return;

    addStock({
      symbol: symbol.toUpperCase(),
      quantity: Number(quantity),
      price: Number(price),
    });

    setSymbol("");
    setQuantity("");
    setPrice("");
  };

  return (
    <form onSubmit={handleSubmit} className="formRow">
      <input
        type="text"
        placeholder="Stock Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="input inputSymbol"
      />

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="input inputQty"
      />

      <input
        type="number"
        step="0.01"
        placeholder="Purchase Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="input inputPrice"
      />

      <button type="submit" className="button">
        Add Stock
      </button>
    </form>
  );
}
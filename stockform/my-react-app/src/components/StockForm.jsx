import { useState, useContext } from "react";
import { StockContext } from "../context/StockContext";

export default function StockForm() {
  const { addStock, formError } = useContext(StockContext);

  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symbol || !quantity || !price) return;

    const result = await addStock({
      symbol: symbol.trim().toUpperCase(),
      quantity: Number(quantity),
      price: Number(price),
    });

    // ✅ Only clear form if stock was valid
    if (result?.ok) {
      setSymbol("");
      setQuantity("");
      setPrice("");
    }
  };

  return (
    <>
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
          min="1"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Purchase Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input inputPrice"
          min="0"
        />
        <button type="submit" className="button">
          Add Stock
        </button>
      </form>

      {/* ✅ Show validation error */}
      {formError && (
        <div style={{ marginTop: 8, color: "red", fontSize: 14 }}>
          {formError}
        </div>
      )}
    </>
  );
}
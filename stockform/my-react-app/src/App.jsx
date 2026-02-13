import stonks from "./assets/stonks.png";
import StockForm from "./components/StockForm.jsx";
import StockList from "./components/StockList.jsx";
import { useContext } from "react";
import { StockContext } from "./context/StockContext.jsx";

export default function App() {
  const { stocks, addStock } = useContext(StockContext);

  return (
    <div className="container">
      <img src={stonks} alt="Stonks logo" className="headerImage" />
      <h1 className="title">Finance Dashboard</h1>

      <StockForm onAddStock={addStock} />

      <h2 className="sectionTitle">Stock List</h2>

      <StockList stocks={stocks} />
    </div>
  );
}
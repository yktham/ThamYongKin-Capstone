import stonks from "./assets/stonks.png";
import StockForm from "./components/StockForm.jsx";
import StockList from "./components/StockList.jsx";

export default function App() {
  return (
    <div className="container">
      <img src={stonks} alt="Stonks logo" className="headerImage" />

      <h1 className="title">Finance Dashboard</h1>

      <StockForm />
      <h2 className="sectionTitle">Stock List</h2>
      <StockList />
    </div>
  );
}
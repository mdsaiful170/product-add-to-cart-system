
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { CartProvider } from "./CartContext";
import ProductPage from "./ProductPage";
import CartPage from "./CartPage";

const App = () => {
  return (
    <CartProvider>
      <Router>
        <nav className="p-4 bg-gray-200">
          <Link to="/" className="mr-4">
            Home
          </Link>
          <Link to="/cart">Cart</Link>
        </nav>
        <Routes>
          <Route path="/" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;

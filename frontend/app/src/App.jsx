import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";

import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/Layout";
import UserManagementPage from "./pages/UserManagementPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProductsSection from "./pages/ProductsSection";
import CategoryPage from "./components/CategoryPage";
import AdminComponent from "./components/AdminComponent";


function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas envueltas en Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/Home" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/products" element={<ProductsSection />}>
            <Route path=":categoryName" element={<CategoryPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/adminDashboard" element={<UserManagementPage />} />
          <Route path="/owner" element={<AdminComponent />} />
        </Route>
        <Route path="/admin" element={<AdminPanel />} />

      </Routes>
    </Router>
  );
}

export default App;

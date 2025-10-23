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
import UserProfilePage from "./pages/UserProfilePage";
import UserOrdersPage from "./pages/UserOrdersPage";
import UserOrderDetailPage from "./pages/UserOrderDetailPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import OwnerSection from "./pages/OwnerSection";
import { Provider } from "react-redux";
import Store from "./Store";
import { Toaster } from "react-hot-toast";
import OwnerSection2 from "./pages/OwnerSection2";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./components/orderConfirmationComponenets/OrderConfirmation";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import ContactPage from "./pages/ContactPage";

function App() {
  return (
    <Provider store={Store}>
      <Toaster
        position="bottom-left"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      <Router>
        <Routes>
          {/* Rutas públicas envueltas en Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/Home" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orderConfirmation" element={<OrderConfirmation />} />
            <Route path="/myorders" element={<UserOrdersPage />} />
            <Route
              path="/myorders/:orderId"
              element={<UserOrderDetailPage />}
            />
            <Route path="/paymentMethods" element={<PaymentMethodsPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/adminDashboard" element={<UserManagementPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/owner" element={<OwnerSection />} />
            <Route path="/products" element={<ProductsSection />}>
              <Route path=":categoryName" element={<CategoryPage />} />
              <Route path=":categoryName/:subCategoryName" element={<CategoryPage />} />
            </Route>
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/changePassword" element={<ChangePasswordPage />} />
            <Route path="/reset/password" element={<ResetPassword />} />
            <Route
              path="dj-rest-auth/registration/account-confirm-email/:key/"
              Component={EmailVerificationPage}
            />
            <Route
              path="reset/password/confirm/:uid/:token"
              Component={ResetPasswordConfirm}
            />
          </Route>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/owner2" element={<OwnerSection2 />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;

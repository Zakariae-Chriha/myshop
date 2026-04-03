import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ForgotPassword    from './pages/customer/ForgotPassword';
import ResetPassword     from './pages/customer/ResetPassword';
import ConfirmDelivery   from './pages/customer/ConfirmDelivery';
import Wishlist          from './pages/customer/Wishlist';
import Navbar      from './components/Navbar';
import Footer      from './components/Footer';
import CookieBanner from './components/CookieBanner';
import ChatWidget   from './components/ChatWidget';
import AdminsManager from './pages/admin/AdminsManager';
import Home          from './pages/customer/Home';
import Shop          from './pages/customer/Shop';
import ProductDetail from './pages/customer/ProductDetail';
import Cart          from './pages/customer/Cart';
import Checkout      from './pages/customer/Checkout';
import OrderConfirm  from './pages/customer/OrderConfirm';
import TrackOrder    from './pages/customer/TrackOrder';
import MyAccount     from './pages/customer/MyAccount';
import Login         from './pages/customer/Login';
import Register      from './pages/customer/Register';
import Impressum     from './pages/Impressum';
import Datenschutz   from './pages/Datenschutz';
import AGB           from './pages/AGB';

import AdminLogin        from './pages/admin/AdminLogin';
import ReviewsManager    from './pages/admin/ReviewsManager';
import OAuthCallback     from './pages/customer/OAuthCallback';
import Dashboard         from './pages/admin/Dashboard';
import ProductsManager   from './pages/admin/ProductsManager';
import OrdersManager     from './pages/admin/OrdersManager';
import CustomersManager  from './pages/admin/CustomersManager';
import CouponsManager    from './pages/admin/CouponsManager';
import CategoriesManager from './pages/admin/CategoriesManager';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  return user && isAdmin ? children : <Navigate to="/admin/login" />;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/shop"          element={<Shop />} />
          <Route path="/product/:id"   element={<ProductDetail />} />
          <Route path="/cart"          element={<Cart />} />
          <Route path="/track"         element={<TrackOrder />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/impressum"     element={<Impressum />} />
          <Route path="/datenschutz"   element={<Datenschutz />} />
          <Route path="/agb"           element={<AGB />} />

          <Route path="/checkout"      element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-confirm" element={<ProtectedRoute><OrderConfirm /></ProtectedRoute>} />
          <Route path="/account"       element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
          <Route path="/wishlist"      element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

          <Route path="/admin/login"      element={<AdminLogin />} />
          <Route path="/admin"            element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/products"   element={<AdminRoute><ProductsManager /></AdminRoute>} />
          <Route path="/admin/orders"     element={<AdminRoute><OrdersManager /></AdminRoute>} />
          <Route path="/admin/customers"  element={<AdminRoute><CustomersManager /></AdminRoute>} />
          <Route path="/admin/coupons"    element={<AdminRoute><CouponsManager /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><CategoriesManager /></AdminRoute>} />
          <Route path="/oauth-callback"             element={<OAuthCallback />} />
          <Route path="/forgot-password"           element={<ForgotPassword />} />
          <Route path="/reset-password/:token"     element={<ResetPassword />} />
          <Route path="/confirm-delivery/:token"   element={<ConfirmDelivery />} />
<Route path="/admin/admins"   element={<AdminRoute><AdminsManager /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><ReviewsManager /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
      <CookieBanner />
    </BrowserRouter>
  );
};

const App = () => (
  <AuthProvider>
    <CartProvider>
      <AppContent />
      <ChatWidget />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1E1B4B',
            color: '#F1F5F9',
            border: '1px solid rgba(165,180,252,0.2)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#A5B4FC', secondary: '#1E1B4B' } },
          error:   { iconTheme: { primary: '#FF6584', secondary: '#1E1B4B' } },
        }}
      />
    </CartProvider>
  </AuthProvider>
);

export default App;
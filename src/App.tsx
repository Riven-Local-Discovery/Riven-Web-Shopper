import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteLayout, TabsLayout } from '@/components/Layout';
import { LoadingState } from '@/components/States';
import { useAuth } from '@/context/AuthContext';
import DeleteAccountPage from '@/pages/account/DeleteAccount';
import EditProfilePage from '@/pages/account/EditProfile';
import SettingsPage from '@/pages/account/Settings';
import LoginPage from '@/pages/auth/Login';
import RegisterPage from '@/pages/auth/Register';
import WelcomePage from '@/pages/auth/Welcome';
import BazaarDetailPage from '@/pages/bazaars/BazaarDetail';
import BazaarsPage from '@/pages/bazaars/Bazaars';
import BoothMapPage from '@/pages/bazaars/BoothMap';
import CheckoutPage from '@/pages/checkout/Checkout';
import PaymentPage from '@/pages/checkout/Payment';
import NotFoundPage from '@/pages/NotFound';
import CancelOrderPage from '@/pages/orders/CancelOrder';
import ConfirmDeliveryPage from '@/pages/orders/ConfirmDelivery';
import OrderDetailPage from '@/pages/orders/OrderDetail';
import ProductDetailPage from '@/pages/products/ProductDetail';
import ProductsPage from '@/pages/products/Products';
import FavoritesPage from '@/pages/social/Favorites';
import FollowingPage from '@/pages/social/Following';
import RatingsPage from '@/pages/social/Ratings';
import CartPage from '@/pages/tabs/Cart';
import ExplorePage from '@/pages/tabs/Explore';
import HomePage from '@/pages/tabs/Home';
import OrdersPage from '@/pages/tabs/Orders';
import ProfilePage from '@/pages/tabs/Profile';
import VendorPage from '@/pages/vendors/Vendor';

// The map page pulls in Leaflet, so it loads on demand.
const LocationPage = lazy(() => import('@/pages/account/Location'));

export default function App() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="splash">
        <LoadingState />
      </div>
    );
  }

  if (status === 'signedOut') {
    return (
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route element={<TabsLayout />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="bazaars" element={<BazaarsPage />} />
        <Route path="bazaars/:id" element={<BazaarDetailPage />} />
        <Route path="bazaars/:id/map" element={<BoothMapPage />} />

        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="vendors/:id" element={<VendorPage />} />

        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="checkout/payment" element={<PaymentPage />} />

        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="orders/:id/cancel" element={<CancelOrderPage />} />
        <Route path="orders/:id/confirm" element={<ConfirmDeliveryPage />} />

        <Route path="social/favorites" element={<FavoritesPage />} />
        <Route path="social/following" element={<FollowingPage />} />
        <Route path="social/ratings/:vendorId" element={<RatingsPage />} />

        <Route path="account/settings" element={<SettingsPage />} />
        <Route path="account/edit" element={<EditProfilePage />} />
        <Route
          path="account/location"
          element={
            <Suspense fallback={<LoadingState />}>
              <LocationPage />
            </Suspense>
          }
        />
        <Route path="account/delete" element={<DeleteAccountPage />} />

        {/* Signing in from /login or /register lands on the home page. */}
        <Route path="login" element={<Navigate to="/" replace />} />
        <Route path="register" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

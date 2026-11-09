import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useCart, useMe } from '@/api/hooks';
import { USE_MOCKS } from '@/api/client';
import { colors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { IconButton } from './Screen';
import { Avatar, Logo } from './ui';

export { useDocumentTitle } from './Screen';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const NAV: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/bazaars', label: 'Bazaars' },
  { to: '/products', label: 'Shop' },
  { to: '/orders', label: 'Orders' },
];

/** Site chrome for signed-in pages: top bar on every page, plus the footer. */
export function SiteLayout() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: cart } = useCart();

  return (
    <div className="site">
      <ScrollToTop />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="topbar-logo" aria-label="Riven home">
            <Logo size="sm" />
          </Link>
          <nav className="topbar-nav" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="topbar-actions">
            <IconButton name="search" label="Search products" onPress={() => navigate('/products?focus=1')} />
            <IconButton name="heart-outline" label="Favorites" onPress={() => navigate('/social/favorites')} />
            <IconButton name="bag-handle-outline" label="Cart" badge={cart?.itemsCount} onPress={() => navigate('/cart')} />
            <Link to="/profile" className="topbar-avatar" aria-label="Your profile">
              <Avatar uri={me?.avatarUrl} name={me?.fullName} size={34} />
            </Link>
          </div>
        </div>
      </header>
      <main id="main" className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Riven · Discover. Connect. Belong.</span>
        {USE_MOCKS ? <span className="demo-pill">Demo data</span> : null}
      </footer>
    </div>
  );
}

const TABS: { to: string; label: string; icon: IconName; activeIcon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Home', icon: 'home-outline', activeIcon: 'home', end: true },
  { to: '/explore', label: 'Explore', icon: 'search-outline', activeIcon: 'search' },
  { to: '/cart', label: 'Cart', icon: 'bag-handle-outline', activeIcon: 'bag-handle' },
  { to: '/orders', label: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt' },
  { to: '/profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

/** The five main sections. On phones they get the app-style bottom tab bar. */
export function TabsLayout() {
  const { data: cart } = useCart();
  return (
    <div className="with-tabbar">
      <Outlet />
      <nav className="tabbar" aria-label="Sections">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tabbar-item${isActive ? ' tabbar-item-active' : ''}`}>
            {({ isActive }) => (
              <>
                <span className="tabbar-icon">
                  <Icon name={isActive ? t.activeIcon : t.icon} size={22} color={isActive ? colors.secondary : colors.tertiary} />
                  {t.to === '/cart' && cart?.itemsCount ? <span className="count-badge">{cart.itemsCount}</span> : null}
                </span>
                {t.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

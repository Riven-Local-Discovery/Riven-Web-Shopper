import { Link, useNavigate } from 'react-router-dom';
import { useDiscovery, useMe } from '@/api/hooks';
import { AppText } from '@/components/AppText';
import { BazaarHeroCard, BazaarTile, ProductGrid } from '@/components/cards';
import { Icon } from '@/components/Icon';
import { Screen, useDocumentTitle } from '@/components/Screen';
import { ErrorState, LoadingState } from '@/components/States';
import { SearchBar, SectionHeader } from '@/components/ui';
import { colors } from '@/theme';
import { firstName, greeting } from '@/utils/format';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const location = me?.location;
  const feed = useDiscovery(location ? { lat: location.lat, lng: location.lng } : undefined);
  useDocumentTitle('Discover');

  return (
    <Screen width="wide">
      <div className="home-top">
        <div>
          <AppText variant="bodySm">
            {greeting()}, {firstName(me?.fullName)}
          </AppText>
          <Link to="/account/location" className="location-link">
            <Icon name="location" size={16} color={colors.secondary} />
            <AppText variant="title" as="span">
              {location ? `${location.city}, ${location.country}` : 'Set your location'}
            </AppText>
            <Icon name="chevron-down" size={14} color={colors.textMuted} />
          </Link>
        </div>
      </div>

      <SearchBar placeholder="Search bazaars, vendors, products…" onPress={() => navigate('/products?focus=1')} />

      {feed.isLoading ? (
        <LoadingState />
      ) : feed.isError ? (
        <ErrorState error={feed.error} onRetry={feed.refetch} />
      ) : feed.data ? (
        <>
          <SectionHeader title="Upcoming Bazaars" action="See all" onAction={() => navigate('/bazaars')} />
          <div className="h-scroll h-scroll-hero">
            {feed.data.upcoming.map((b) => (
              <BazaarHeroCard key={b.id} bazaar={b} />
            ))}
          </div>

          <SectionHeader title="Nearby" action="Map & list" onAction={() => navigate('/bazaars')} />
          <div className="h-scroll">
            {feed.data.nearby.map((b) => (
              <BazaarTile key={b.id} bazaar={b} />
            ))}
          </div>

          <SectionHeader title="Trending from makers" action="Browse" onAction={() => navigate('/explore')} />
          <ProductGrid products={feed.data.trendingProducts} />
        </>
      ) : null}
    </Screen>
  );
}

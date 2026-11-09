import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites, useToggleFavorite } from '@/api/hooks';
import type { Favorite, FavoriteType } from '@/api/types';
import { AppText } from '@/components/AppText';
import { FavoriteButton } from '@/components/cards';
import { Header, Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { ChipRow } from '@/components/ui';
import { colors } from '@/theme';
import { formatDateRange, formatPrice } from '@/utils/format';

type Filter = 'all' | FavoriteType;
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'vendor', label: 'Vendors' },
  { value: 'bazaar', label: 'Bazaars' },
  { value: 'product', label: 'Products' },
];

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const favorites = useFavorites(filter === 'all' ? undefined : filter);
  const items = favorites.data ?? [];

  return (
    <Screen header={<Header title="Favorites" />}>
      <ChipRow options={FILTERS} value={filter} onChange={setFilter} style={{ marginBottom: 16 }} />
      {favorites.isLoading ? (
        <LoadingState />
      ) : favorites.isError ? (
        <ErrorState error={favorites.error} onRetry={favorites.refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No favorites yet"
          message="Tap the heart on products, vendors and bazaars to save them here."
          actionLabel="Explore"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="stack grid-2">
          {items.map((f) => (
            <FavoriteRow key={f.id} favorite={f} />
          ))}
        </div>
      )}
    </Screen>
  );
}

function describe(favorite: Favorite) {
  switch (favorite.type) {
    case 'product':
      return {
        image: favorite.product.images[0],
        title: favorite.product.name,
        subtitle: `${favorite.product.vendor.name} · ${formatPrice(favorite.product.price, favorite.product.currency)}`,
        targetId: favorite.product.id,
        href: `/products/${favorite.product.id}`,
        round: false,
      };
    case 'vendor':
      return {
        image: favorite.vendor.logoUrl,
        title: favorite.vendor.name,
        subtitle: favorite.vendor.tagline,
        targetId: favorite.vendor.id,
        href: `/vendors/${favorite.vendor.id}`,
        round: true,
      };
    case 'bazaar':
      return {
        image: favorite.bazaar.coverUrl,
        title: favorite.bazaar.name,
        subtitle: formatDateRange(favorite.bazaar.startDate, favorite.bazaar.endDate),
        targetId: favorite.bazaar.id,
        href: `/bazaars/${favorite.bazaar.id}`,
        round: false,
      };
  }
}

function FavoriteRow({ favorite }: { favorite: Favorite }) {
  const toggle = useToggleFavorite();
  const { image, title, subtitle, targetId, href, round } = describe(favorite);

  return (
    <div className="row-card">
      <Link to={href} className="row" style={{ flex: 1, gap: 12, minWidth: 0 }}>
        <img src={image} alt="" className="fav-image" style={round ? { borderRadius: '50%' } : undefined} loading="lazy" />
        <span style={{ flex: 1, display: 'grid', gap: 2, minWidth: 0 }}>
          <AppText variant="caption" color={colors.secondary} style={{ textTransform: 'capitalize' }}>
            {favorite.type}
          </AppText>
          <AppText variant="title" as="span" lines={1}>
            {title}
          </AppText>
          <AppText variant="caption" lines={1}>
            {subtitle}
          </AppText>
        </span>
      </Link>
      <FavoriteButton active onPress={() => toggle.mutate({ type: favorite.type, targetId, favorite: false })} />
    </div>
  );
}

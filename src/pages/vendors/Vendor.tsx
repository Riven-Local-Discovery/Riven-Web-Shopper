import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '@/api/client';
import { useFavorites, useProducts, useRatings, useToggleFavorite, useToggleFollow, useVendor } from '@/api/hooks';
import type { Vendor } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FavoriteButton, ProductGrid } from '@/components/cards';
import { Icon, type IconName } from '@/components/Icon';
import { RatingsBreakdown, ReviewItem } from '@/components/RatingsSummaryView';
import { IconButton, Screen, useDocumentTitle, useGoBack } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { Avatar, RatingInline, Tabs } from '@/components/ui';
import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';

type Tab = 'about' | 'products' | 'reviews';
const TABS: { value: Tab; label: string }[] = [
  { value: 'about', label: 'About' },
  { value: 'products', label: 'Products' },
  { value: 'reviews', label: 'Reviews' },
];

export default function VendorPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const bazaarId = params.get('bazaarId');
  const goBack = useGoBack();
  const vendor = useVendor(id);
  const follow = useToggleFollow();
  const favorites = useFavorites('vendor');
  const toggleFavorite = useToggleFavorite();
  const [tab, setTab] = useState<Tab>('about');
  useDocumentTitle(vendor.data?.name ?? 'Vendor');

  if (!vendor.data) {
    return <Screen>{vendor.isLoading ? <LoadingState /> : <ErrorState error={vendor.error} onRetry={vendor.refetch} />}</Screen>;
  }
  const v = vendor.data;
  const isFavorite = !!favorites.data?.some((f) => f.type === 'vendor' && f.vendor.id === v.id);

  const onFollow = () =>
    follow.mutate({ vendorId: v.id, follow: !v.isFollowing }, { onError: (e) => showAlert('Follow', getErrorMessage(e)) });

  return (
    <Screen width="wide" className="page-cover">
      <div className="cover cover-md">
        <img src={v.coverUrl} alt="" className="cover-img" />
        <span className="cover-shade" />
        <div className="cover-bar">
          <IconButton name="chevron-back" label="Go back" variant="glass" onPress={goBack} />
          <AppText variant="h3" as="span" color={colors.textOnDark}>
            {bazaarId ? 'Bazaar vendor' : 'Vendor Profile'}
          </AppText>
          <FavoriteButton
            active={isFavorite}
            onPress={() => toggleFavorite.mutate({ type: 'vendor', targetId: v.id, favorite: !isFavorite })}
          />
        </div>
      </div>

      <div className="vendor-body">
        <div className="vendor-identity">
          <Avatar uri={v.logoUrl} name={v.name} size={84} ring />
          <Button
            title={v.isFollowing ? 'Following' : 'Follow'}
            icon={v.isFollowing ? 'checkmark' : 'add'}
            size="sm"
            variant={v.isFollowing ? 'outline' : 'primary'}
            fullWidth={false}
            loading={follow.isPending}
            onPress={onFollow}
            style={{ marginTop: 48 }}
          />
        </div>
        <AppText variant="h1" style={{ marginTop: 12 }}>
          {v.name}
        </AppText>
        <AppText variant="bodySm">{v.tagline}</AppText>
        <div className="row" style={{ gap: 6, marginTop: 8 }}>
          <RatingInline rating={v.rating} count={v.reviewsCount} />
          <AppText variant="caption">· {v.followersCount.toLocaleString()} followers</AppText>
        </div>

        <div style={{ marginTop: 20 }}>
          <Tabs tabs={TABS} value={tab} onChange={setTab} />
        </div>
        <div style={{ marginTop: 16 }} role="tabpanel">
          {tab === 'about' ? <About vendor={v} /> : null}
          {tab === 'products' ? <VendorProducts vendorId={v.id} /> : null}
          {tab === 'reviews' ? <VendorReviews vendorId={v.id} /> : null}
        </div>
      </div>
    </Screen>
  );
}

function Fact({ icon, text }: { icon: IconName; text: string }) {
  return (
    <div className="row" style={{ gap: 12 }}>
      <Icon name={icon} size={18} color={colors.secondary} />
      <AppText variant="body">{text}</AppText>
    </div>
  );
}

function About({ vendor }: { vendor: Vendor }) {
  return (
    <div className="stack" style={{ maxWidth: 760 }}>
      <AppText variant="body" color={colors.textMuted}>
        {vendor.about}
      </AppText>
      <Fact icon="location-outline" text={vendor.city} />
      <Fact icon="cube-outline" text={vendor.shipsNationwide ? 'Ships nationwide' : 'Local pickup & delivery only'} />
      <Fact icon="swap-horizontal-outline" text={vendor.exchangeDays ? `${vendor.exchangeDays}-day exchange` : 'Final sale (perishable goods)'} />
      <Fact icon="ribbon-outline" text={`Making since ${vendor.foundedYear}`} />
      <div className="h-scroll" style={{ gap: 8, marginTop: 8 }}>
        {vendor.gallery.map((uri) => (
          <img key={uri} src={uri} alt="" className="gallery-image" loading="lazy" />
        ))}
      </div>
    </div>
  );
}

function VendorProducts({ vendorId }: { vendorId: string }) {
  const products = useProducts({ vendorId });
  if (products.isLoading) return <LoadingState />;
  if (products.isError) return <ErrorState error={products.error} onRetry={products.refetch} />;
  if (!products.data?.items.length) return <EmptyState icon="pricetags-outline" title="No products yet" />;
  return <ProductGrid products={products.data.items} />;
}

function VendorReviews({ vendorId }: { vendorId: string }) {
  const navigate = useNavigate();
  const ratings = useRatings(vendorId);
  if (ratings.isLoading) return <LoadingState />;
  if (ratings.isError || !ratings.data) return <ErrorState error={ratings.error} onRetry={ratings.refetch} />;
  if (!ratings.data.count) return <EmptyState icon="star-outline" title="No reviews yet" />;
  return (
    <div style={{ maxWidth: 760 }}>
      <RatingsBreakdown summary={ratings.data} />
      {ratings.data.items.slice(0, 3).map((r) => (
        <ReviewItem key={r.id} rating={r} />
      ))}
      <Button title="See all reviews" variant="outline" style={{ marginTop: 16 }} onPress={() => navigate(`/social/ratings/${vendorId}`)} />
    </div>
  );
}

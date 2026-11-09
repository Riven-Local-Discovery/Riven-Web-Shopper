import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useToggleFavorite } from '@/api/hooks';
import type { Bazaar, Order, Product, VendorSummary } from '@/api/types';
import { colors } from '@/theme';
import { formatDate, formatDateRange, formatDistance, formatPrice, ORDER_STATUS } from '@/utils/format';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { Avatar, Badge, RatingInline } from './ui';

export function FavoriteButton({
  active,
  onPress,
  className,
  style,
}: {
  active: boolean;
  onPress: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPress();
      }}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={active}
      className={`fav-btn${className ? ` ${className}` : ''}`}
      style={style}
    >
      <Icon name={active ? 'heart' : 'heart-outline'} size={18} color={active ? colors.secondary : colors.primary} />
    </button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const toggle = useToggleFavorite();
  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-link">
        <img src={product.images[0]} alt="" className="product-image" loading="lazy" />
        <div className="product-body">
          <AppText variant="label" lines={1} as="p">
            {product.name}
          </AppText>
          <AppText variant="caption" lines={1} as="p">
            {product.vendor.name}
          </AppText>
          <AppText variant="title" color={colors.secondary} style={{ marginTop: 2 }}>
            {formatPrice(product.price, product.currency)}
          </AppText>
        </div>
      </Link>
      <FavoriteButton
        active={product.isFavorite}
        onPress={() => toggle.mutate({ type: 'product', targetId: product.id, favorite: !product.isFavorite })}
        className="fav-overlay"
      />
    </div>
  );
}

/** Responsive product grid used on list screens. */
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function BazaarHeroCard({ bazaar }: { bazaar: Bazaar }) {
  return (
    <Link to={`/bazaars/${bazaar.id}`} className="hero-card">
      <img src={bazaar.coverUrl} alt="" className="cover-img" />
      <span className="hero-shade" />
      <span className="hero-top">
        <Badge label={bazaar.status === 'live' ? 'Happening now' : 'Upcoming'} tone={bazaar.status === 'live' ? 'accent' : 'neutral'} />
      </span>
      <span className="hero-body">
        <AppText variant="h2" as="span" color={colors.textOnDark} lines={2}>
          {bazaar.name}
        </AppText>
        <span className="meta-row">
          <Icon name="calendar-outline" size={14} color={colors.textOnDark} />
          <AppText variant="caption" color={colors.textOnDark}>
            {formatDateRange(bazaar.startDate, bazaar.endDate)}
          </AppText>
          {bazaar.distanceKm !== undefined ? (
            <>
              <Icon name="location-outline" size={14} color={colors.textOnDark} style={{ marginLeft: 8 }} />
              <AppText variant="caption" color={colors.textOnDark}>
                {formatDistance(bazaar.distanceKm)}
              </AppText>
            </>
          ) : null}
        </span>
      </span>
    </Link>
  );
}

export function BazaarTile({ bazaar }: { bazaar: Bazaar }) {
  return (
    <Link to={`/bazaars/${bazaar.id}`} className="tile">
      <img src={bazaar.coverUrl} alt="" className="tile-image" loading="lazy" />
      <AppText variant="label" lines={1} as="p" style={{ marginTop: 8 }}>
        {bazaar.name}
      </AppText>
      {bazaar.distanceKm !== undefined ? <AppText variant="caption">{formatDistance(bazaar.distanceKm)} away</AppText> : null}
    </Link>
  );
}

export function BazaarRow({ bazaar }: { bazaar: Bazaar }) {
  return (
    <Link to={`/bazaars/${bazaar.id}`} className="row-card">
      <img src={bazaar.coverUrl} alt="" className="row-image" loading="lazy" />
      <span style={{ flex: 1, display: 'grid', gap: 4, minWidth: 0 }}>
        <AppText variant="title" as="span" lines={1}>
          {bazaar.name}
        </AppText>
        <span className="meta-row">
          <Icon name="calendar-outline" size={13} color={colors.textMuted} />
          <AppText variant="caption">{formatDateRange(bazaar.startDate, bazaar.endDate)}</AppText>
        </span>
        <span className="meta-row">
          <Icon name="location-outline" size={13} color={colors.textMuted} />
          <AppText variant="caption">
            {bazaar.city}
            {bazaar.distanceKm !== undefined ? ` · ${formatDistance(bazaar.distanceKm)}` : ''}
          </AppText>
        </span>
      </span>
      <Icon name="chevron-forward" size={18} color={colors.textSubtle} />
    </Link>
  );
}

export function VendorRow({ vendor, right, to }: { vendor: VendorSummary; right?: ReactNode; to?: string }) {
  const body = (
    <>
      <Avatar uri={vendor.logoUrl} name={vendor.name} size={48} />
      <span style={{ flex: 1, display: 'grid', gap: 2, minWidth: 0 }}>
        <AppText variant="title" as="span" lines={1}>
          {vendor.name}
        </AppText>
        <AppText variant="caption" lines={1}>
          {vendor.tagline}
        </AppText>
        <RatingInline rating={vendor.rating} count={vendor.reviewsCount} />
      </span>
    </>
  );
  const href = to ?? `/vendors/${vendor.id}`;
  // With a custom action on the right, only the vendor details are the link, so buttons don't nest inside <a>.
  if (right) {
    return (
      <div className="row-card">
        <Link to={href} className="row" style={{ flex: 1, gap: 12, minWidth: 0 }}>
          {body}
        </Link>
        {right}
      </div>
    );
  }
  return (
    <Link to={href} className="row-card">
      {body}
      <Icon name="chevron-forward" size={18} color={colors.textSubtle} />
    </Link>
  );
}

export function OrderCard({ order }: { order: Order }) {
  const status = ORDER_STATUS[order.status];
  return (
    <Link to={`/orders/${order.id}`} className="row-card">
      <img src={order.items[0]?.imageUrl} alt="" className="order-image" loading="lazy" />
      <span style={{ flex: 1, display: 'grid', gap: 3, minWidth: 0 }}>
        <AppText variant="title" as="span">
          {order.number}
        </AppText>
        <AppText variant="caption">
          {formatDate(order.createdAt)} · {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
        </AppText>
        <AppText variant="caption" lines={1}>
          {order.vendor.name}
        </AppText>
      </span>
      <span style={{ display: 'grid', justifyItems: 'end', gap: 8 }}>
        <Badge label={status.label} tone={status.tone} />
        <AppText variant="title" as="span">
          {formatPrice(order.total, order.currency)}
        </AppText>
      </span>
    </Link>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '@/api/client';
import { useAddToCart, useProduct, useToggleFavorite } from '@/api/hooks';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FavoriteButton, VendorRow } from '@/components/cards';
import { Header, IconButton, Screen } from '@/components/Screen';
import { ErrorState, LoadingState } from '@/components/States';
import { QuantityStepper, RatingInline } from '@/components/ui';
import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';
import { share } from '@/utils/browser';
import { formatPrice } from '@/utils/format';

export default function ProductDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const product = useProduct(id);
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();
  const [imageIndex, setImageIndex] = useState(0);
  const [color, setColor] = useState<string>();
  const [size, setSize] = useState<string>();
  const [quantity, setQuantity] = useState(1);

  const p = product.data;

  if (!p) {
    return (
      <Screen header={<Header title="Product" />}>
        {product.isLoading ? <LoadingState /> : <ErrorState error={product.error} onRetry={product.refetch} />}
      </Screen>
    );
  }

  // Default to the first option until the shopper picks one.
  const selectedColor = color ?? p.colors[0];
  const selectedSize = size ?? p.sizes[0];
  const outOfStock = p.stock <= 0;
  const image = p.images[Math.min(imageIndex, p.images.length - 1)];

  const onAdd = () =>
    addToCart.mutate(
      { productId: p.id, quantity, color: selectedColor, size: selectedSize },
      {
        onSuccess: () =>
          showAlert(
            'Added to cart',
            `${quantity} × ${p.name}`,
            [
              { text: 'Keep shopping', style: 'cancel' },
              { text: 'View cart', onPress: () => navigate('/cart') },
            ],
            { icon: 'bag-check-outline', tone: 'success' },
          ),
        onError: (e) => showAlert('Could not add to cart', getErrorMessage(e), undefined, { icon: 'alert-circle-outline', tone: 'danger' }),
      },
    );

  return (
    <Screen
      width="wide"
      header={<Header title={p.name} right={<IconButton name="share-outline" label="Share" onPress={() => share(`${p.name} on Riven`)} />} />}
      footer={
        <div className="row buy-bar" style={{ gap: 16 }}>
          <div>
            <AppText variant="caption">Total</AppText>
            <AppText variant="h3" as="p">
              {formatPrice(p.price * quantity, p.currency)}
            </AppText>
          </div>
          <Button
            title={outOfStock ? 'Out of stock' : 'Add to Cart'}
            icon="bag-add-outline"
            onPress={onAdd}
            loading={addToCart.isPending}
            disabled={outOfStock}
            style={{ flex: 1 }}
          />
        </div>
      }
    >
      <div className="product-detail">
        <div className="gallery">
          <div className="gallery-main">
            <img src={image} alt={p.name} />
            <FavoriteButton
              active={p.isFavorite}
              onPress={() => toggleFavorite.mutate({ type: 'product', targetId: p.id, favorite: !p.isFavorite })}
              className="fav-overlay fav-lg"
            />
          </div>
          {p.images.length > 1 ? (
            <div className="gallery-thumbs" role="tablist" aria-label="Product images">
              {p.images.map((uri, i) => (
                <button
                  key={uri}
                  type="button"
                  role="tab"
                  aria-selected={i === imageIndex}
                  aria-label={`Image ${i + 1}`}
                  className={`thumb${i === imageIndex ? ' thumb-active' : ''}`}
                  onClick={() => setImageIndex(i)}
                >
                  <img src={uri} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <AppText variant="h2" as="h1">
            {p.name}
          </AppText>
          <div style={{ marginTop: 8 }}>
            <RatingInline rating={p.rating} count={p.reviewsCount} />
          </div>
          <div className="price-row">
            <AppText variant="h1" as="p" color={colors.secondary}>
              {formatPrice(p.price, p.currency)}
            </AppText>
            {p.compareAtPrice ? (
              <AppText variant="bodySm" as="s">
                {formatPrice(p.compareAtPrice, p.currency)}
              </AppText>
            ) : null}
            <AppText variant="caption" color={outOfStock ? colors.danger : p.stock < 5 ? colors.warning : colors.success}>
              {outOfStock ? 'Out of stock' : p.stock < 5 ? `Only ${p.stock} left` : 'In stock'}
            </AppText>
          </div>

          {p.colors.length ? <OptionGroup label="Color" options={p.colors} value={selectedColor} onChange={setColor} /> : null}
          {p.sizes.length ? <OptionGroup label="Size" options={p.sizes} value={selectedSize} onChange={setSize} /> : null}

          <div className="row" style={{ justifyContent: 'space-between', marginTop: 20 }}>
            <AppText variant="label">Quantity</AppText>
            <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, p.stock)} />
          </div>

          <AppText variant="h3" style={{ marginTop: 24, marginBottom: 8 }}>
            Description
          </AppText>
          <AppText variant="body" color={colors.textMuted}>
            {p.description}
          </AppText>

          <AppText variant="h3" style={{ marginTop: 24, marginBottom: 12 }}>
            Sold by
          </AppText>
          <VendorRow vendor={p.vendor} />
        </div>
      </div>
    </Screen>
  );
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="option-group">
      <legend>
        <AppText variant="label">
          {label}: <span style={{ color: colors.textMuted }}>{value}</span>
        </AppText>
      </legend>
      <div className="wrap-row">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={`option${value === o ? ' option-active' : ''}`}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

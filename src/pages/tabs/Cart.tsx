import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/api/client';
import { useCart, useRemoveCartItem, useToggleFavorite, useUpdateCartItem } from '@/api/hooks';
import type { CartItem } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen, useDocumentTitle } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { Card, Divider, QuantityStepper, SummaryRow } from '@/components/ui';
import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';
import { formatPrice } from '@/utils/format';

export default function CartPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const data = cart.data;
  const hasItems = !!data?.items.length;
  useDocumentTitle('Cart');

  return (
    <Screen
      footer={hasItems ? <Button title="Checkout" icon="lock-closed-outline" onPress={() => navigate('/checkout')} /> : undefined}
    >
      <AppText variant="h1" style={{ margin: '16px 0' }}>
        Your Cart
      </AppText>

      {cart.isLoading ? (
        <LoadingState />
      ) : cart.isError ? (
        <ErrorState error={cart.error} onRetry={cart.refetch} />
      ) : !hasItems || !data ? (
        <EmptyState
          icon="bag-handle-outline"
          title="Your cart is empty"
          message="Discover handmade pieces from local makers and add them here."
          actionLabel="Start exploring"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="split">
          <div className="stack">
            {data.items.map((item) => (
              <CartRow key={item.id} item={item} />
            ))}
          </div>

          <Card className="split-aside">
            <SummaryRow label={`Subtotal (${data.itemsCount} items)`} value={formatPrice(data.subtotal, data.currency)} />
            <SummaryRow label="Shipping" value={formatPrice(data.shipping, data.currency)} />
            <Divider style={{ margin: '8px 0' }} />
            <SummaryRow label="Total" value={formatPrice(data.total, data.currency)} strong />
          </Card>
        </div>
      )}
    </Screen>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const toggleFavorite = useToggleFavorite();
  const busy = update.isPending || remove.isPending;
  const onError = (e: unknown) => showAlert('Cart', getErrorMessage(e));

  const confirmRemove = () =>
    showAlert('Remove item', `Remove ${item.product.name} from your cart?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove.mutate(item.id, { onError }) },
    ]);

  const variant = [item.color, item.size].filter(Boolean).join(' · ');

  return (
    <Card className="cart-row" style={busy ? { opacity: 0.6 } : undefined}>
      <Link to={`/products/${item.product.id}`} aria-label={item.product.name}>
        <img src={item.product.images[0]} alt="" className="cart-image" />
      </Link>
      <div className="cart-row-body">
        <div className="row" style={{ gap: 8 }}>
          <Link to={`/products/${item.product.id}`} style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="title" lines={1}>
              {item.product.name}
            </AppText>
          </Link>
          <button
            type="button"
            className="icon-plain"
            aria-label={item.isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            aria-pressed={item.isFavorite}
            onClick={() => toggleFavorite.mutate({ type: 'product', targetId: item.product.id, favorite: !item.isFavorite })}
          >
            <Icon name={item.isFavorite ? 'heart' : 'heart-outline'} size={18} color={colors.secondary} />
          </button>
        </div>
        <AppText variant="caption" lines={1} as="p">
          {variant || item.product.vendor.name}
        </AppText>
        <div className="cart-row-bottom">
          <AppText variant="title" color={colors.secondary}>
            {formatPrice(item.lineTotal, item.product.currency)}
          </AppText>
          <div className="row" style={{ gap: 12 }}>
            <button type="button" className="icon-plain" onClick={confirmRemove} aria-label="Remove item">
              <Icon name="trash-outline" size={18} color={colors.textMuted} />
            </button>
            <QuantityStepper
              value={item.quantity}
              max={item.product.stock}
              disabled={busy}
              onChange={(quantity) => (quantity < 1 ? confirmRemove() : update.mutate({ itemId: item.id, quantity }, { onError }))}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

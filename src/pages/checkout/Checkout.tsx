import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/api/client';
import { useCart, useCheckout, useMe } from '@/api/hooks';
import type { ShippingAddress } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Header, Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { TextField } from '@/components/TextField';
import { Badge, Card, Divider, SummaryRow } from '@/components/ui';
import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';
import { formatPrice } from '@/utils/format';

type Method = 'online' | 'cash_on_delivery';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const { data: me } = useMe();
  const checkout = useCheckout();
  const [method, setMethod] = useState<Method>('online');
  const [editing, setEditing] = useState(false);
  // Only fields the shopper has edited; everything else is prefilled from their profile.
  const [edits, setEdits] = useState<Partial<ShippingAddress>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  const address: ShippingAddress = {
    fullName: edits.fullName ?? me?.fullName ?? '',
    phone: edits.phone ?? me?.phone ?? '',
    city: edits.city ?? (me?.location ? `${me.location.city}, ${me.location.country}` : ''),
    address: edits.address ?? me?.location?.address ?? '',
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!address.fullName.trim()) next.fullName = 'Required';
    if (address.phone.replace(/\D/g, '').length < 8) next.phone = 'Enter a valid phone number';
    if (!address.city.trim()) next.city = 'Required';
    if (address.address.trim().length < 5) next.address = 'Enter your street address';
    setErrors(next);
    if (Object.keys(next).length) setEditing(true);
    return !Object.keys(next).length;
  };

  const proceed = () => {
    if (!validate()) return;
    if (method === 'online') {
      navigate('/checkout/payment', { state: { address } });
      return;
    }
    checkout.mutate(
      { shippingAddress: address, paymentMethod: 'cash_on_delivery' },
      {
        onSuccess: (res) =>
          showAlert('Order placed', 'Pay in cash when your order arrives.', [
            {
              text: 'View orders',
              onPress: () => navigate(res.orderIds.length === 1 ? `/orders/${res.orderIds[0]}` : '/orders', { replace: true }),
            },
          ]),
        onError: (e) => showAlert('Checkout failed', getErrorMessage(e)),
      },
    );
  };

  const data = cart.data;
  const field = (key: keyof ShippingAddress) => ({
    value: address[key],
    onChangeText: (t: string) => setEdits((e) => ({ ...e, [key]: t })),
    error: errors[key],
  });

  return (
    <Screen
      header={<Header title="Checkout" />}
      footer={
        data?.items.length ? (
          <div className="checkout-footer">
            <Button title={method === 'online' ? 'Proceed to Payment' : 'Place Order'} onPress={proceed} loading={checkout.isPending} />
            <span className="row" style={{ justifyContent: 'center', gap: 4, marginTop: 8 }}>
              <Icon name="lock-closed" size={12} color={colors.textMuted} />
              <AppText variant="caption">Secure payment with Paymob</AppText>
            </span>
          </div>
        ) : undefined
      }
    >
      {cart.isLoading ? (
        <LoadingState />
      ) : cart.isError ? (
        <ErrorState error={cart.error} onRetry={cart.refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon="bag-handle-outline" title="Your cart is empty" actionLabel="Go shopping" onAction={() => navigate('/explore', { replace: true })} />
      ) : (
        <div className="split">
          <div className="stack" style={{ gap: 16 }}>
            <Card>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <AppText variant="h3">Shipping Address</AppText>
                <button type="button" className="link" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
                  {editing ? 'Done' : 'Change'}
                </button>
              </div>
              {editing ? (
                <div style={{ marginTop: 12 }}>
                  <TextField label="Full name" autoComplete="name" {...field('fullName')} />
                  <TextField label="Phone" type="tel" autoComplete="tel" {...field('phone')} />
                  <TextField label="City" autoComplete="address-level2" {...field('city')} />
                  <TextField label="Street address" placeholder="Building, street, apartment" autoComplete="street-address" {...field('address')} />
                </div>
              ) : (
                <div style={{ marginTop: 8, display: 'grid', gap: 2 }}>
                  <AppText variant="label">{address.fullName || '—'}</AppText>
                  <AppText variant="bodySm">{address.address || 'Add your street address'}</AppText>
                  <AppText variant="bodySm">
                    {address.city} {address.phone ? `· ${address.phone}` : ''}
                  </AppText>
                </div>
              )}
            </Card>

            <Card>
              <AppText variant="h3" style={{ marginBottom: 12 }}>
                Payment Method
              </AppText>
              <div role="radiogroup" aria-label="Payment method">
                <MethodOption
                  selected={method === 'online'}
                  onPress={() => setMethod('online')}
                  title="Paymob (Online)"
                  subtitle="Card, wallet, Fawry or Apple Pay"
                  badge="Recommended"
                />
                <MethodOption
                  selected={method === 'cash_on_delivery'}
                  onPress={() => setMethod('cash_on_delivery')}
                  title="Cash on Delivery"
                  subtitle="Pay when your order arrives"
                />
              </div>
            </Card>
          </div>

          <Card className="split-aside">
            <AppText variant="h3" style={{ marginBottom: 8 }}>
              Order Summary
            </AppText>
            {data.items.map((i) => (
              <SummaryRow key={i.id} label={`${i.quantity} × ${i.product.name}`} value={formatPrice(i.lineTotal, data.currency)} />
            ))}
            <Divider />
            <SummaryRow label={`${data.itemsCount} items`} value={formatPrice(data.subtotal, data.currency)} />
            <SummaryRow label="Shipping" value={formatPrice(data.shipping, data.currency)} />
            <Divider />
            <SummaryRow label="Total" value={formatPrice(data.total, data.currency)} strong />
          </Card>
        </div>
      )}
    </Screen>
  );
}

function MethodOption({
  selected,
  onPress,
  title,
  subtitle,
  badge,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <button type="button" onClick={onPress} className={`choice${selected ? ' choice-active' : ''}`} role="radio" aria-checked={selected}>
      <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={selected ? colors.secondary : colors.textSubtle} />
      <span style={{ flex: 1, textAlign: 'left' }}>
        <AppText variant="label" as="span" style={{ display: 'block' }}>
          {title}
        </AppText>
        <AppText variant="caption">{subtitle}</AppText>
      </span>
      {badge ? <Badge label={badge} tone="accent" /> : null}
    </button>
  );
}

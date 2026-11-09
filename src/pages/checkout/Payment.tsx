import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage, USE_MOCKS } from '@/api/client';
import { useCart, useCheckout, useRetryPayment } from '@/api/hooks';
import type { CheckoutResponse, PaymentMethod, ShippingAddress } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { Header, Screen } from '@/components/Screen';
import { Card, SummaryRow } from '@/components/ui';
import { colors } from '@/theme';
import { formatPrice, PAYMENT_LABEL } from '@/utils/format';

type OnlineMethod = Exclude<PaymentMethod, 'cash_on_delivery'>;
type Status = 'idle' | 'processing' | 'redirecting' | 'failed' | 'success';

// Apple Pay is offered only where the browser supports it (Safari on Apple devices).
const supportsApplePay = typeof window !== 'undefined' && 'ApplePaySession' in window;

const METHODS: { value: OnlineMethod; icon: IconName; hint: string }[] = [
  { value: 'card', icon: 'card-outline', hint: 'Visa, Mastercard, Meeza' },
  { value: 'wallet', icon: 'wallet-outline', hint: 'Vodafone Cash, Etisalat, Orange' },
  { value: 'fawry', icon: 'receipt-outline', hint: 'Pay at any Fawry outlet' },
  { value: 'apple_pay', icon: 'logo-apple', hint: 'Fast checkout with Face ID' },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  // A new checkout carries the address in navigation state; paying for an existing order uses query params.
  const address = (location.state as { address?: ShippingAddress } | null)?.address;
  const paramGroupId = params.get('orderGroupId') ?? undefined;

  const cart = useCart(!paramGroupId);
  const checkout = useCheckout();
  const retry = useRetryPayment();
  const [method, setMethod] = useState<OnlineMethod>('card');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  // Set once the order group exists; subsequent attempts go through retry-payment.
  const [session, setSession] = useState<CheckoutResponse | null>(null);

  const orderGroupId = session?.orderGroupId ?? paramGroupId;
  const total = session?.total ?? (params.get('total') ? Number(params.get('total')) : (cart.data?.total ?? 0));
  const currency = session?.currency ?? params.get('currency') ?? cart.data?.currency ?? 'USD';
  const methods = METHODS.filter((m) => m.value !== 'apple_pay' || supportsApplePay);

  // Reloading this page loses the address from navigation state; restart from checkout.
  if (!address && !orderGroupId) return <Navigate to="/checkout" replace />;

  /** Returns true when the payment is already settled, false when the shopper was sent to the gateway. */
  const settle = (res: CheckoutResponse): boolean => {
    if (!res.paymentUrl || res.paymentStatus === 'paid') return true;
    if (USE_MOCKS) return true; // the mock gateway approves every payment
    const back = `${window.location.origin}/orders`;
    const url = `${res.paymentUrl}${res.paymentUrl.includes('?') ? '&' : '?'}redirect_url=${encodeURIComponent(back)}`;
    window.location.assign(url);
    return false;
  };

  const pay = async () => {
    setError('');
    setStatus('processing');
    try {
      const res = orderGroupId
        ? await retry.mutateAsync({ orderGroupId, paymentMethod: method })
        : await checkout.mutateAsync({ shippingAddress: address!, paymentMethod: method });
      setSession(res);
      setStatus(settle(res) ? 'success' : 'redirecting');
    } catch (e) {
      setStatus('failed');
      setError(getErrorMessage(e));
    }
  };

  const orderIds = session?.orderIds ?? [];
  const goToOrders = () => navigate(orderIds.length === 1 ? `/orders/${orderIds[0]}` : '/orders', { replace: true });

  if (status === 'success') {
    return (
      <Screen width="narrow">
        <div className="result">
          <span className="result-icon" style={{ backgroundColor: colors.successSoft }}>
            <Icon name="checkmark" size={40} color={colors.success} />
          </span>
          <AppText variant="h1" align="center">
            Payment successful
          </AppText>
          <AppText variant="bodySm" align="center">
            Thank you! We&apos;ve sent your order to the makers. You&apos;ll be notified when it ships.
          </AppText>
          <Button title="View my order" onPress={goToOrders} style={{ marginTop: 20 }} />
          <Button title="Continue shopping" variant="ghost" onPress={() => navigate('/', { replace: true })} />
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      width="narrow"
      header={<Header title="Payment" onBack={orderGroupId && !paramGroupId ? () => navigate('/orders', { replace: true }) : undefined} />}
      footer={
        <Button
          title={status === 'failed' ? 'Try again' : status === 'redirecting' ? 'Opening Paymob…' : `Pay ${formatPrice(total, currency)}`}
          onPress={pay}
          loading={status === 'processing' || status === 'redirecting'}
        />
      }
    >
      <div className="secure-header">
        <span className="result-icon result-icon-sm" style={{ backgroundColor: colors.successSoft }}>
          <Icon name="shield-checkmark" size={26} color={colors.success} />
        </span>
        <AppText variant="h3">Secure Checkout</AppText>
        <AppText variant="caption" align="center" as="p">
          Payments are processed by Paymob. Riven never stores your card details.
        </AppText>
      </div>

      <AppText variant="label" as="p" color={colors.textMuted} style={{ marginBottom: 8 }}>
        Pay with
      </AppText>
      <Card style={{ padding: '4px 16px' }}>
        <div role="radiogroup" aria-label="Pay with">
          {methods.map((m, i) => {
            const selected = method === m.value;
            return (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMethod(m.value)}
                className={`method-row${i < methods.length - 1 ? ' list-row-border' : ''}`}
              >
                <span className="icon-tile icon-tile-sm">
                  <Icon name={m.icon} size={20} color={colors.primary} />
                </span>
                <span style={{ flex: 1, textAlign: 'left' }}>
                  <AppText variant="label" as="span" style={{ display: 'block' }}>
                    {PAYMENT_LABEL[m.value]}
                  </AppText>
                  <AppText variant="caption">{m.hint}</AppText>
                </span>
                <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={selected ? colors.secondary : colors.textSubtle} />
              </button>
            );
          })}
        </div>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <SummaryRow label="Order total" value={formatPrice(total, currency)} strong />
        {orderGroupId ? <AppText variant="caption">Order reference: {orderGroupId}</AppText> : null}
      </Card>

      {error ? (
        <div className="error-box" role="alert">
          <Icon name="alert-circle" size={18} color={colors.danger} />
          <AppText variant="bodySm" color={colors.danger} style={{ flex: 1 }}>
            {error}
          </AppText>
        </div>
      ) : null}
    </Screen>
  );
}

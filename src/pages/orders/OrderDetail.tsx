import { useNavigate, useParams } from 'react-router-dom';
import { useOrder } from '@/api/hooks';
import type { OrderStatus } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { VendorRow } from '@/components/cards';
import { Icon } from '@/components/Icon';
import { Header, Screen } from '@/components/Screen';
import { ErrorState, LoadingState } from '@/components/States';
import { Badge, Card, Divider, SummaryRow } from '@/components/ui';
import { colors } from '@/theme';
import { formatDate, formatPrice, ORDER_STATUS, PAYMENT_LABEL } from '@/utils/format';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Placed' },
  { status: 'paid', label: 'Confirmed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
];

export default function OrderDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const order = useOrder(id);
  const o = order.data;

  if (!o) {
    return (
      <Screen header={<Header title="Order Details" />}>
        {order.isLoading ? <LoadingState /> : <ErrorState error={order.error} onRetry={order.refetch} />}
      </Screen>
    );
  }

  const status = ORDER_STATUS[o.status];
  const stepIndex = STEPS.findIndex((s) => s.status === o.status);
  const canCancel = o.status === 'pending' || o.status === 'paid';
  const canConfirm = o.status === 'shipped';
  const canRate = o.status === 'delivered' && !o.isRated;
  const awaitingPayment = o.status === 'pending' && o.paymentMethod !== 'cash_on_delivery';

  const footer =
    canConfirm || canRate || awaitingPayment || canCancel ? (
      <div className="footer-actions">
        {canConfirm ? <Button title="Confirm Delivery" onPress={() => navigate(`/orders/${o.id}/confirm`)} /> : null}
        {canRate ? <Button title="Rate Your Experience" icon="star-outline" onPress={() => navigate(`/orders/${o.id}/confirm`)} /> : null}
        {awaitingPayment ? (
          <Button
            title="Complete Payment"
            onPress={() =>
              navigate(`/checkout/payment?${new URLSearchParams({ orderGroupId: o.orderGroupId, total: String(o.total), currency: o.currency })}`)
            }
          />
        ) : null}
        {canCancel ? <Button title="Cancel Order" variant="outline" onPress={() => navigate(`/orders/${o.id}/cancel`)} /> : null}
      </div>
    ) : undefined;

  return (
    <Screen header={<Header title={`Order ${o.number}`} />} footer={footer}>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <AppText variant="h3">{o.number}</AppText>
            <AppText variant="caption">
              {formatDate(o.createdAt)} · {o.itemsCount} items
            </AppText>
          </div>
          <Badge label={status.label} tone={status.tone} />
        </div>

        {o.status === 'cancelled' ? (
          <div className="error-box">
            <Icon name="close-circle" size={18} color={colors.danger} />
            <AppText variant="bodySm" color={colors.danger} style={{ flex: 1 }}>
              This order was cancelled{o.cancelReason ? `: ${o.cancelReason}` : '.'}
            </AppText>
          </div>
        ) : (
          <ol className="steps" aria-label="Order progress">
            {STEPS.map((s, i) => {
              const done = i <= stepIndex;
              return (
                <li key={s.status} className="step" aria-current={i === stepIndex ? 'step' : undefined}>
                  <span className="step-track">
                    <span className={`step-line${i === 0 ? ' step-line-hidden' : ''}${done ? ' step-line-done' : ''}`} />
                    <span className={`step-dot${done ? ' step-dot-done' : ''}`}>
                      {done ? <Icon name="checkmark" size={12} color={colors.textOnDark} /> : null}
                    </span>
                    <span className={`step-line${i === STEPS.length - 1 ? ' step-line-hidden' : ''}${i < stepIndex ? ' step-line-done' : ''}`} />
                  </span>
                  <AppText variant="caption" color={done ? colors.text : colors.textSubtle}>
                    {s.label}
                  </AppText>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <AppText variant="h3" style={{ margin: '20px 0 12px' }}>
        Items
      </AppText>
      <Card style={{ padding: '4px 16px' }}>
        {o.items.map((item, i) => (
          <div key={item.id} className={`order-item${i < o.items.length - 1 ? ' list-row-border' : ''}`}>
            <img src={item.imageUrl} alt="" className="order-item-image" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="label" lines={1} as="p">
                {item.name}
              </AppText>
              <AppText variant="caption">
                {[item.color, item.size].filter(Boolean).join(' · ') || 'Standard'} · Qty {item.quantity}
              </AppText>
            </div>
            <AppText variant="label">{formatPrice(item.unitPrice * item.quantity, o.currency)}</AppText>
          </div>
        ))}
      </Card>

      <AppText variant="h3" style={{ margin: '20px 0 12px' }}>
        Vendor
      </AppText>
      <VendorRow vendor={o.vendor} />

      <AppText variant="h3" style={{ margin: '20px 0 12px' }}>
        Delivery & Payment
      </AppText>
      <Card className="stack" style={{ gap: 12 }}>
        <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
          <Icon name="location-outline" size={18} color={colors.secondary} />
          <div style={{ flex: 1 }}>
            <AppText variant="label" as="p">
              {o.shippingAddress.fullName}
            </AppText>
            <AppText variant="caption" as="p">
              {o.shippingAddress.address}, {o.shippingAddress.city}
            </AppText>
            <AppText variant="caption" as="p">
              {o.shippingAddress.phone}
            </AppText>
          </div>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <Icon name="card-outline" size={18} color={colors.secondary} />
          <AppText variant="label">{PAYMENT_LABEL[o.paymentMethod]}</AppText>
        </div>
        <Divider style={{ margin: 0 }} />
        <div>
          <SummaryRow label="Subtotal" value={formatPrice(o.subtotal, o.currency)} />
          <SummaryRow label="Shipping" value={formatPrice(o.shipping, o.currency)} />
          <SummaryRow label="Total" value={formatPrice(o.total, o.currency)} strong />
        </div>
      </Card>
    </Screen>
  );
}

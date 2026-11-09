import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getErrorMessage } from '@/api/client';
import { useCancelOrder, useOrder } from '@/api/hooks';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Header, Screen, useGoBack } from '@/components/Screen';
import { ErrorState, LoadingState } from '@/components/States';
import { TextField } from '@/components/TextField';
import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';
import { formatPrice } from '@/utils/format';

const REASONS = ['Ordered by mistake', 'Found a better price', 'Delivery takes too long', 'Want to change items or address', 'Other'];

export default function CancelOrderPage() {
  const { id = '' } = useParams();
  const goBack = useGoBack(`/orders/${id}`);
  const order = useOrder(id);
  const cancel = useCancelOrder();
  const [reason, setReason] = useState<string>();
  const [details, setDetails] = useState('');

  const o = order.data;
  const finalReason = reason === 'Other' ? details.trim() : [reason, details.trim()].filter(Boolean).join(' — ');

  const submit = () =>
    cancel.mutate(
      { id, reason: finalReason },
      {
        onSuccess: () => {
          showAlert('Order cancelled', 'Any payment will be refunded to your original payment method.');
          goBack();
        },
        onError: (e) => showAlert('Could not cancel', getErrorMessage(e)),
      },
    );

  return (
    <Screen
      width="narrow"
      header={<Header title="Cancel Order" />}
      footer={
        <div className="footer-actions">
          <Button
            title="Cancel Order"
            variant="danger"
            onPress={submit}
            loading={cancel.isPending}
            disabled={!o || !reason || (reason === 'Other' && !details.trim())}
          />
          <Button title="Keep Order" variant="ghost" onPress={goBack} />
        </div>
      }
    >
      {!o ? (
        order.isLoading ? (
          <LoadingState />
        ) : (
          <ErrorState error={order.error} onRetry={order.refetch} />
        )
      ) : (
        <>
          <AppText variant="h3">Are you sure you want to cancel this order?</AppText>
          <AppText variant="bodySm" style={{ marginTop: 4 }}>
            This action cannot be undone. {o.number} · {formatPrice(o.total, o.currency)}
          </AppText>

          <div className="h-scroll" style={{ gap: 12, padding: '20px 0' }}>
            {o.items.map((i) => (
              <div key={i.id} className="mini-item">
                <img src={i.imageUrl} alt="" />
                <AppText variant="caption" lines={1} as="p">
                  {i.name}
                </AppText>
                <AppText variant="label">{formatPrice(i.unitPrice, o.currency)}</AppText>
              </div>
            ))}
          </div>

          <AppText variant="h3" id="reason-label" style={{ marginBottom: 12 }}>
            Reason for cancellation
          </AppText>
          <div role="radiogroup" aria-labelledby="reason-label">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={reason === r}
                onClick={() => setReason(r)}
                className={`choice choice-surface${reason === r ? ' choice-active' : ''}`}
              >
                <Icon name={reason === r ? 'radio-button-on' : 'radio-button-off'} size={20} color={reason === r ? colors.secondary : colors.textSubtle} />
                <AppText variant="body" as="span">
                  {r}
                </AppText>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <TextField
              label={reason === 'Other' ? 'Tell us more (required)' : 'Additional details (optional)'}
              multiline
              value={details}
              onChangeText={setDetails}
              placeholder="Anything the vendor should know?"
            />
          </div>
        </>
      )}
    </Screen>
  );
}

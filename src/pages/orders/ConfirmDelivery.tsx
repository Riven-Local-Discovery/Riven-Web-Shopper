import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getErrorMessage } from '@/api/client';
import { useConfirmDelivery, useCreateRating, useOrder } from '@/api/hooks';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Header, Screen, useGoBack } from '@/components/Screen';
import { ErrorState, LoadingState } from '@/components/States';
import { TextField } from '@/components/TextField';
import { Avatar, Card, Stars } from '@/components/ui';
import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

/** Two-step flow: confirm the order was received, then rate the vendor. */
export default function ConfirmDeliveryPage() {
  const { id = '' } = useParams();
  const goBack = useGoBack(`/orders/${id}`);
  const order = useOrder(id);
  const confirm = useConfirmDelivery();
  const rate = useCreateRating();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const o = order.data;
  const step: 'confirm' | 'rate' | 'done' = !o ? 'confirm' : o.isRated ? 'done' : o.status === 'delivered' ? 'rate' : 'confirm';

  const onConfirm = () => confirm.mutate(id, { onError: (e) => showAlert('Could not confirm delivery', getErrorMessage(e)) });

  const onRate = () =>
    rate.mutate(
      { orderId: id, vendorId: o!.vendor.id, rating, comment: comment.trim() },
      {
        onSuccess: () => {
          showAlert('Thank you!', 'Your review helps other shoppers and supports local makers.');
          goBack();
        },
        onError: (e) => showAlert('Could not submit review', getErrorMessage(e)),
      },
    );

  const footer =
    step === 'confirm' ? (
      <div className="footer-actions">
        <Button title="Confirm Delivery" onPress={onConfirm} loading={confirm.isPending} disabled={!o} />
        <Button title="Not yet" variant="ghost" onPress={goBack} />
      </div>
    ) : step === 'rate' ? (
      <div className="footer-actions">
        <Button title="Submit Review" onPress={onRate} loading={rate.isPending} disabled={!rating} />
        <Button title="Maybe later" variant="ghost" onPress={goBack} />
      </div>
    ) : (
      <Button title="Close" variant="dark" onPress={goBack} />
    );

  return (
    <Screen width="narrow" header={<Header title={step === 'confirm' ? 'Confirm Delivery' : 'Rate your order'} />} footer={footer}>
      {!o ? (
        order.isLoading ? (
          <LoadingState />
        ) : (
          <ErrorState error={order.error} onRetry={order.refetch} />
        )
      ) : step === 'confirm' ? (
        <div className="center-block">
          <span className="result-icon">
            <Icon name="cube-outline" size={40} color={colors.secondary} />
          </span>
          <AppText variant="h2" align="center">
            Have you received your order?
          </AppText>
          <AppText variant="bodySm" align="center">
            Confirming delivery of {o.number} from {o.vendor.name} will unlock the ability to leave a rating and review.
          </AppText>
        </div>
      ) : step === 'rate' ? (
        <>
          <div className="center-block">
            <span className="result-icon" style={{ backgroundColor: colors.successSoft }}>
              <Icon name="checkmark-done" size={36} color={colors.success} />
            </span>
            <AppText variant="h2" align="center">
              Order delivered!
            </AppText>
            <AppText variant="bodySm" align="center">
              How was your experience with this maker?
            </AppText>
          </div>
          <Card className="rate-card">
            <Avatar uri={o.vendor.logoUrl} name={o.vendor.name} size={56} />
            <AppText variant="h3">{o.vendor.name}</AppText>
            <Stars value={rating} size={34} onChange={setRating} />
            <AppText variant="label" color={colors.secondary} style={{ minHeight: 18 }} aria-live="polite">
              {RATING_LABELS[rating]}
            </AppText>
          </Card>
          <div style={{ marginTop: 16 }}>
            <TextField
              label="Your review"
              multiline
              value={comment}
              onChangeText={setComment}
              placeholder="What did you love? Anything to improve?"
            />
          </div>
        </>
      ) : (
        <div className="center-block">
          <span className="result-icon" style={{ backgroundColor: colors.successSoft }}>
            <Icon name="heart" size={36} color={colors.success} />
          </span>
          <AppText variant="h2" align="center">
            Thanks for your review
          </AppText>
          <AppText variant="bodySm" align="center">
            You&apos;ve already rated this order.
          </AppText>
        </div>
      )}
    </Screen>
  );
}

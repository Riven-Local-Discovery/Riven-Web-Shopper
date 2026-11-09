import type { Rating, RatingsSummary } from '@/api/types';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';
import { AppText } from './AppText';
import { Avatar, Card, Stars } from './ui';

export function RatingsBreakdown({ summary }: { summary: RatingsSummary }) {
  return (
    <Card className="ratings-summary">
      <div className="ratings-average">
        <AppText variant="display" as="p">
          {summary.average.toFixed(1)}
        </AppText>
        <Stars value={summary.average} />
        <AppText variant="caption">{summary.count} reviews</AppText>
      </div>
      <div style={{ flex: 1, display: 'grid', gap: 6 }}>
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const pct = summary.count ? summary.distribution[star] / summary.count : 0;
          return (
            <div key={star} className="bar-row">
              <AppText variant="caption" style={{ width: 10 }}>
                {star}
              </AppText>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${pct * 100}%` }} />
              </span>
              <AppText variant="caption" style={{ width: 22, textAlign: 'right' }}>
                {summary.distribution[star]}
              </AppText>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function ReviewItem({ rating }: { rating: Rating }) {
  return (
    <div className="review">
      <Avatar uri={rating.author.avatarUrl} name={rating.author.fullName} size={40} />
      <div style={{ flex: 1, display: 'grid', gap: 4 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <AppText variant="label">{rating.author.fullName}</AppText>
          <AppText variant="caption">{formatDate(rating.createdAt)}</AppText>
        </div>
        <Stars value={rating.rating} size={12} />
        {rating.productName ? <AppText variant="caption">Purchased: {rating.productName}</AppText> : null}
        <AppText variant="bodySm" color={colors.text}>
          {rating.comment}
        </AppText>
      </div>
    </div>
  );
}

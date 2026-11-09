import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRatings, useVendor } from '@/api/hooks';
import { AppText } from '@/components/AppText';
import { RatingsBreakdown, ReviewItem } from '@/components/RatingsSummaryView';
import { Header, Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { ChipRow } from '@/components/ui';

type Filter = 'all' | '5' | '4' | '3' | 'low';
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '5', label: '5 ★' },
  { value: '4', label: '4 ★' },
  { value: '3', label: '3 ★' },
  { value: 'low', label: '1–2 ★' },
];

export default function RatingsPage() {
  const { vendorId = '' } = useParams();
  const vendor = useVendor(vendorId);
  const ratings = useRatings(vendorId);
  const [filter, setFilter] = useState<Filter>('all');

  const items = useMemo(() => {
    const list = ratings.data?.items ?? [];
    if (filter === 'all') return list;
    if (filter === 'low') return list.filter((r) => r.rating <= 2);
    return list.filter((r) => r.rating === Number(filter));
  }, [ratings.data, filter]);

  return (
    <Screen header={<Header title="Ratings & Reviews" />}>
      {vendor.data ? (
        <AppText variant="bodySm" style={{ marginBottom: 12 }}>
          What shoppers say about {vendor.data.name}
        </AppText>
      ) : null}
      {ratings.isLoading ? (
        <LoadingState />
      ) : ratings.isError || !ratings.data ? (
        <ErrorState error={ratings.error} onRetry={ratings.refetch} />
      ) : (
        <>
          <RatingsBreakdown summary={ratings.data} />
          <ChipRow options={FILTERS} value={filter} onChange={setFilter} style={{ marginTop: 16 }} />
          {items.length === 0 ? (
            <EmptyState icon="star-outline" title="No reviews match this filter" />
          ) : (
            <div>
              {items.map((r) => (
                <ReviewItem key={r.id} rating={r} />
              ))}
            </div>
          )}
        </>
      )}
    </Screen>
  );
}

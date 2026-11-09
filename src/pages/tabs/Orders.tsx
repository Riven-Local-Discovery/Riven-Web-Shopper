import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/api/hooks';
import type { OrderStatus } from '@/api/types';
import { AppText } from '@/components/AppText';
import { OrderCard } from '@/components/cards';
import { Screen, useDocumentTitle } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { ChipRow } from '@/components/ui';

type Filter = 'all' | OrderStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const orders = useOrders(filter === 'all' ? undefined : filter);
  const items = orders.data?.items ?? [];
  useDocumentTitle('My Orders');

  return (
    <Screen>
      <AppText variant="h1" style={{ margin: '16px 0 12px' }}>
        My Orders
      </AppText>
      <ChipRow options={FILTERS} value={filter} onChange={setFilter} style={{ marginBottom: 16 }} />

      {orders.isLoading ? (
        <LoadingState />
      ) : orders.isError ? (
        <ErrorState error={orders.error} onRetry={orders.refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={filter === 'all' ? 'No orders yet' : 'Nothing here'}
          message={filter === 'all' ? 'When you place an order it will show up here.' : 'No orders with this status.'}
          actionLabel={filter === 'all' ? 'Start shopping' : undefined}
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="stack">
          {items.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </Screen>
  );
}

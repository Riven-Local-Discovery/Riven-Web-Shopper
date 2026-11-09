import { useState } from 'react';
import type { BazaarFilter } from '@/api/endpoints';
import { useBazaars } from '@/api/hooks';
import { BazaarRow } from '@/components/cards';
import { Header, Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { ChipRow, SearchBar } from '@/components/ui';

const FILTERS: { value: BazaarFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'weekend', label: 'This Weekend' },
];

export default function BazaarsPage() {
  const [filter, setFilter] = useState<BazaarFilter>('all');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const bazaars = useBazaars(filter, submitted || undefined);
  const items = bazaars.data?.items ?? [];

  return (
    <Screen header={<Header title="Bazaars" />}>
      <SearchBar
        value={query}
        onChangeText={(t) => {
          setQuery(t);
          if (!t) setSubmitted('');
        }}
        placeholder="Search bazaars…"
        onSubmit={() => setSubmitted(query.trim())}
      />
      <ChipRow options={FILTERS} value={filter} onChange={setFilter} style={{ margin: '16px 0' }} />

      {bazaars.isLoading ? (
        <LoadingState />
      ) : bazaars.isError ? (
        <ErrorState error={bazaars.error} onRetry={bazaars.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="storefront-outline" title="No bazaars found" message="Try a different filter or search term." />
      ) : (
        <div className="stack grid-2">
          {items.map((b) => (
            <BazaarRow key={b.id} bazaar={b} />
          ))}
        </div>
      )}
    </Screen>
  );
}

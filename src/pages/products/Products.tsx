import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCategories, useProducts } from '@/api/hooks';
import type { ProductSort } from '@/api/types';
import { AppText } from '@/components/AppText';
import { ProductGrid } from '@/components/cards';
import { Icon } from '@/components/Icon';
import { Header, Screen } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { ChipRow, SearchBar, Sheet } from '@/components/ui';
import { colors } from '@/theme';

const SORTS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

// Remount on a new query string so the filters start from the URL again.
export default function ProductsPage() {
  const [params] = useSearchParams();
  return <ProductList key={params.toString()} params={params} />;
}

function ProductList({ params }: { params: URLSearchParams }) {
  const initialQ = params.get('q') ?? '';
  const vendorId = params.get('vendorId') ?? undefined;
  const bazaarId = params.get('bazaarId') ?? undefined;
  const title = params.get('title');
  const focus = params.get('focus') === '1';

  const categories = useCategories();
  const [query, setQuery] = useState(initialQ);
  const [q, setQ] = useState(initialQ);
  const [categoryId, setCategoryId] = useState(params.get('categoryId') ?? 'all');
  const [sort, setSort] = useState<ProductSort>('newest');
  const [sortOpen, setSortOpen] = useState(false);

  const products = useProducts({
    q: q || undefined,
    categoryId: categoryId === 'all' ? undefined : categoryId,
    vendorId,
    bazaarId,
    sort,
  });

  const categoryOptions = [{ value: 'all', label: 'All' }, ...(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))];
  const items = products.data?.items ?? [];

  return (
    <Screen width="wide" header={<Header title={title ?? (initialQ || focus ? 'Search' : 'All Products')} />}>
      <SearchBar
        value={query}
        onChangeText={(t) => {
          setQuery(t);
          if (!t) setQ('');
        }}
        onSubmit={() => setQ(query.trim())}
        placeholder="Search products…"
        autoFocus={focus}
        right={
          <button type="button" onClick={() => setSortOpen(true)} className="filter-btn" aria-label="Sort products">
            <Icon name="options-outline" size={16} color={colors.text} />
            Sort
          </button>
        }
      />
      <ChipRow options={categoryOptions} value={categoryId} onChange={setCategoryId} style={{ margin: '16px 0' }} />

      {products.isLoading ? (
        <LoadingState />
      ) : products.isError ? (
        <ErrorState error={products.error} onRetry={products.refetch} />
      ) : items.length === 0 ? (
        <EmptyState icon="search-outline" title="No products found" message="Try another search or category." />
      ) : (
        <>
          <AppText variant="caption" as="p" style={{ marginBottom: 12 }}>
            {products.data?.total} results · {SORTS.find((s) => s.value === sort)?.label}
          </AppText>
          <ProductGrid products={items} />
        </>
      )}

      <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        <div role="radiogroup" aria-label="Sort by">
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={sort === s.value}
              className="sort-row"
              onClick={() => {
                setSort(s.value);
                setSortOpen(false);
              }}
            >
              <AppText variant="body" as="span" weight={sort === s.value ? 'bold' : 'regular'}>
                {s.label}
              </AppText>
              <Icon
                name={sort === s.value ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={sort === s.value ? colors.secondary : colors.textSubtle}
              />
            </button>
          ))}
        </div>
      </Sheet>
    </Screen>
  );
}

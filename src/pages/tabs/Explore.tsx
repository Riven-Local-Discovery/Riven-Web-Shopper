import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategories } from '@/api/hooks';
import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { Screen, useDocumentTitle } from '@/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { Card, SearchBar } from '@/components/ui';
import { colors } from '@/theme';

const productsUrl = (params: Record<string, string>) => `/products?${new URLSearchParams(params)}`;

export default function ExplorePage() {
  const navigate = useNavigate();
  const categories = useCategories();
  const [query, setQuery] = useState('');
  useDocumentTitle('Explore');

  const filtered = useMemo(
    () => (categories.data ?? []).filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())),
    [categories.data, query],
  );

  return (
    <Screen>
      <AppText variant="h1" style={{ margin: '16px 0' }}>
        Categories
      </AppText>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search categories…"
        onSubmit={() => query.trim() && navigate(productsUrl({ q: query.trim() }))}
      />

      <div className="quick-links">
        <QuickLink icon="storefront-outline" label="Bazaars" to="/bazaars" />
        <QuickLink icon="pricetags-outline" label="All products" to="/products" />
      </div>

      {categories.isLoading ? (
        <LoadingState />
      ) : categories.isError ? (
        <ErrorState error={categories.error} onRetry={categories.refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No categories found"
          message={`Search products for “${query}” instead?`}
          actionLabel="Search products"
          onAction={() => navigate(productsUrl({ q: query.trim() }))}
        />
      ) : (
        <Card style={{ padding: '4px 16px' }}>
          {filtered.map((c, i) => (
            <Link
              key={c.id}
              to={productsUrl({ categoryId: c.id, title: c.name })}
              className={`category-row${i < filtered.length - 1 ? ' list-row-border' : ''}`}
            >
              <img src={c.imageUrl} alt="" className="category-thumb" loading="lazy" />
              <span style={{ flex: 1 }}>
                <AppText variant="title" as="span" style={{ display: 'block' }}>
                  {c.name}
                </AppText>
                <AppText variant="caption">{c.productsCount} products</AppText>
              </span>
              <Icon name="chevron-forward" size={18} color={colors.textSubtle} />
            </Link>
          ))}
        </Card>
      )}
    </Screen>
  );
}

function QuickLink({ icon, label, to }: { icon: IconName; label: string; to: string }) {
  return (
    <Link to={to} className="quick-link">
      <Icon name={icon} size={20} color={colors.secondary} />
      <AppText variant="label">{label}</AppText>
    </Link>
  );
}

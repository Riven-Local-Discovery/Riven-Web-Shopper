import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useBazaar, useToggleFavorite } from '@/api/hooks';
import type { Bazaar } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { VendorRow } from '@/components/cards';
import { Icon } from '@/components/Icon';
import { IconButton, Screen, useDocumentTitle, useGoBack } from '@/components/Screen';
import { ErrorState, LoadingState } from '@/components/States';
import { Avatar, Card, Tabs } from '@/components/ui';
import { colors } from '@/theme';
import { openDirections, share } from '@/utils/browser';
import { formatDateRange, formatDistance } from '@/utils/format';

type Tab = 'about' | 'vendors' | 'map' | 'schedule';
const TABS: { value: Tab; label: string }[] = [
  { value: 'about', label: 'About' },
  { value: 'vendors', label: 'Vendors' },
  { value: 'map', label: 'Map' },
  { value: 'schedule', label: 'Schedule' },
];

const vendorUrl = (vendorId: string, bazaarId: string) => `/vendors/${vendorId}?bazaarId=${bazaarId}`;

export default function BazaarDetailPage() {
  const { id = '' } = useParams();
  const goBack = useGoBack('/bazaars');
  const bazaar = useBazaar(id);
  const toggleFavorite = useToggleFavorite();
  const [tab, setTab] = useState<Tab>('about');
  useDocumentTitle(bazaar.data?.name ?? 'Bazaar');

  if (!bazaar.data) {
    return <Screen>{bazaar.isLoading ? <LoadingState /> : <ErrorState error={bazaar.error} onRetry={bazaar.refetch} />}</Screen>;
  }
  const b = bazaar.data;

  return (
    <Screen width="wide" className="page-cover">
      <div className="cover cover-lg">
        <img src={b.coverUrl} alt="" className="cover-img" />
        <span className="cover-shade" />
        <div className="cover-bar">
          <IconButton name="chevron-back" label="Go back" variant="glass" onPress={goBack} />
          <IconButton
            name="share-outline"
            label="Share"
            variant="glass"
            onPress={() => share(`Join me at ${b.name} on Riven — ${formatDateRange(b.startDate, b.endDate)}`)}
          />
        </div>
      </div>

      <div className="cover-sheet">
        <div className="detail-layout">
          <div>
            <AppText variant="h1">{b.name}</AppText>
            <AppText variant="bodySm" style={{ marginTop: 4 }}>
              {b.tags.join(' · ')}
            </AppText>

            <div className="info-row">
              <Icon name="calendar-outline" size={18} color={colors.secondary} />
              <div>
                <AppText variant="label" as="p">
                  {formatDateRange(b.startDate, b.endDate)}
                </AppText>
                <AppText variant="caption">
                  {b.openTime} – {b.closeTime}
                </AppText>
              </div>
            </div>
            <div className="info-row">
              <Icon name="location-outline" size={18} color={colors.secondary} />
              <div>
                <AppText variant="label" as="p">
                  {b.address}
                </AppText>
                {b.distanceKm !== undefined ? <AppText variant="caption">{formatDistance(b.distanceKm)} away</AppText> : null}
              </div>
            </div>

            <div className="row" style={{ gap: 12, marginTop: 20 }}>
              <button
                type="button"
                className={`save-btn${b.isSaved ? ' save-btn-active' : ''}`}
                aria-pressed={b.isSaved}
                onClick={() => toggleFavorite.mutate({ type: 'bazaar', targetId: b.id, favorite: !b.isSaved })}
              >
                <Icon name={b.isSaved ? 'heart' : 'heart-outline'} size={18} color={colors.secondary} />
                {b.isSaved ? 'Saved' : 'Save'}
              </button>
              <Button title="Get Directions" icon="navigate-outline" onPress={() => openDirections(b.location)} style={{ flex: 1 }} />
            </div>
          </div>

          <div>
            <AppText variant="h3" style={{ margin: '24px 0 12px' }}>
              Accepted Vendors
            </AppText>
            <div className="h-scroll" style={{ gap: 12 }}>
              {b.vendors.map((v) => (
                <Link key={v.id} to={vendorUrl(v.id, b.id)} title={v.name} aria-label={v.name}>
                  <Avatar uri={v.logoUrl} name={v.name} size={52} />
                </Link>
              ))}
              {b.vendorsCount > b.vendors.length ? (
                <button type="button" className="more-circle" onClick={() => setTab('vendors')}>
                  +{b.vendorsCount - b.vendors.length}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <Tabs tabs={TABS} value={tab} onChange={setTab} />
        </div>
        <div style={{ marginTop: 16 }} role="tabpanel">
          <TabContent tab={tab} bazaar={b} />
        </div>
      </div>
    </Screen>
  );
}

function TabContent({ tab, bazaar }: { tab: Tab; bazaar: Bazaar }) {
  const navigate = useNavigate();
  switch (tab) {
    case 'about':
      return (
        <div className="stack" style={{ gap: 16, maxWidth: 720 }}>
          <AppText variant="body" color={colors.textMuted}>
            {bazaar.description}
          </AppText>
          <Button
            title="Browse bazaar products"
            variant="dark"
            icon="pricetags-outline"
            fullWidth={false}
            onPress={() => navigate(`/products?${new URLSearchParams({ bazaarId: bazaar.id, title: 'Products' })}`)}
          />
        </div>
      );
    case 'vendors':
      return (
        <div className="stack grid-2">
          {bazaar.vendors.map((v) => (
            <VendorRow key={v.id} vendor={v} to={vendorUrl(v.id, bazaar.id)} />
          ))}
        </div>
      );
    case 'map':
      return (
        <Card onPress={() => navigate(`/bazaars/${bazaar.id}/map`)} className="map-card">
          <span className="icon-tile">
            <Icon name="map-outline" size={26} color={colors.secondary} />
          </span>
          <span style={{ flex: 1, textAlign: 'left' }}>
            <AppText variant="title" as="span" style={{ display: 'block' }}>
              Booth map
            </AppText>
            <AppText variant="caption">Find vendors by booth and plan your visit.</AppText>
          </span>
          <Icon name="chevron-forward" size={18} color={colors.textSubtle} />
        </Card>
      );
    case 'schedule':
      return (
        <Card style={{ padding: '8px 16px' }}>
          {bazaar.schedule.map((s, i) => (
            <div key={`${s.day}-${s.time}`} className={`schedule-row${i < bazaar.schedule.length - 1 ? ' list-row-border' : ''}`}>
              <div style={{ width: 96 }}>
                <AppText variant="label" as="p">
                  {s.day}
                </AppText>
                <AppText variant="caption">{s.time}</AppText>
              </div>
              <AppText variant="body" style={{ flex: 1 }}>
                {s.title}
              </AppText>
            </div>
          ))}
        </Card>
      );
  }
}

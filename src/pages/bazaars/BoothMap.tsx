import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBazaar, useBazaarLayout } from '@/api/hooks';
import type { Booth } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { Header, IconButton } from '@/components/Screen';
import { ErrorState, LoadingState } from '@/components/States';
import { Avatar, Chip } from '@/components/ui';
import { colors } from '@/theme';
import { share } from '@/utils/browser';

const LANDMARK_ICON: Record<string, IconName> = {
  entrance: 'enter-outline',
  food: 'restaurant-outline',
  stage: 'musical-notes-outline',
  restroom: 'water-outline',
};

/** Fits the canvas container's width, so zoom 1 always shows the whole floor plan. */
function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

export default function BoothMapPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const bazaar = useBazaar(id);
  const layout = useBazaarLayout(id);
  const [selected, setSelected] = useState<Booth | null>(null);
  const [zoom, setZoom] = useState(1);
  const [onlyVendors, setOnlyVendors] = useState(false);
  const [canvasRef, containerWidth] = useContainerWidth();

  const scale = layout.data && containerWidth ? (containerWidth / layout.data.width) * zoom : 1;
  const booths = useMemo(() => (layout.data?.booths ?? []).filter((b) => !onlyVendors || b.vendor), [layout.data, onlyVendors]);

  return (
    <div className="booth-page">
      <div className="booth-inner">
        <Header
          title={bazaar.data ? `${bazaar.data.name} · Booth Map` : 'Booth Map'}
          transparent
          right={
            <IconButton
              name="share-outline"
              label="Share"
              variant="glass"
              onPress={() => bazaar.data && share(`Booth map for ${bazaar.data.name} on Riven`)}
            />
          }
        />

        <div className="row" style={{ gap: 8, padding: '0 16px 12px', justifyContent: 'space-between' }}>
          <div className="row" style={{ gap: 8 }}>
            <Chip label="All booths" active={!onlyVendors} onPress={() => setOnlyVendors(false)} />
            <Chip label="With vendors" active={onlyVendors} onPress={() => setOnlyVendors(true)} />
          </div>
          <div className="row" style={{ gap: 8 }}>
            <IconButton name="remove" label="Zoom out" variant="surface" onPress={() => setZoom((z) => Math.max(1, z - 0.5))} />
            <IconButton name="add" label="Zoom in" variant="surface" onPress={() => setZoom((z) => Math.min(2.5, z + 0.5))} />
          </div>
        </div>

        <div ref={canvasRef} className="booth-scroll">
          {!layout.data ? (
            layout.isLoading ? (
              <LoadingState />
            ) : (
              <ErrorState error={layout.error} onRetry={layout.refetch} />
            )
          ) : containerWidth ? (
            <div
              className="booth-canvas"
              style={{ width: layout.data.width * scale, height: layout.data.height * scale }}
              onClick={() => setSelected(null)}
            >
              {layout.data.landmarks.map((l) => (
                <span key={l.label} className="landmark" style={{ left: l.x * scale - 40, top: l.y * scale - 12 }}>
                  <Icon name={LANDMARK_ICON[l.icon]} size={14} color={colors.tertiary} />
                  <AppText variant="caption" color={colors.tertiary}>
                    {l.label}
                  </AppText>
                </span>
              ))}
              {booths.map((b) => {
                const isSelected = selected?.id === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(b);
                    }}
                    aria-label={`Booth ${b.code}${b.vendor ? `, ${b.vendor.name}` : ', available'}`}
                    aria-pressed={isSelected}
                    className={`booth ${b.vendor ? 'booth-taken' : 'booth-free'}${isSelected ? ' booth-selected' : ''}`}
                    style={{ left: b.x * scale, top: b.y * scale, width: b.width * scale, height: b.height * scale }}
                  >
                    {b.vendor ? (
                      <Icon name="location" size={14 * Math.min(zoom, 1.5)} color={isSelected ? colors.textOnDark : colors.secondary} />
                    ) : null}
                    <span
                      style={{
                        fontSize: 10 * Math.min(zoom, 1.5),
                        color: isSelected ? colors.textOnDark : b.vendor ? colors.primary : colors.tertiary,
                      }}
                    >
                      {b.code}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {selected ? (
          <div className="booth-sheet" role="status">
            {selected.vendor ? (
              <button
                type="button"
                className="booth-sheet-row"
                onClick={() => navigate(`/vendors/${selected.vendor!.id}?bazaarId=${id}`)}
              >
                <Avatar uri={selected.vendor.logoUrl} name={selected.vendor.name} size={52} />
                <span style={{ flex: 1, textAlign: 'left' }}>
                  <AppText variant="h3" as="span" style={{ display: 'block' }}>
                    {selected.code}
                  </AppText>
                  <AppText variant="title" as="span" style={{ display: 'block' }}>
                    {selected.vendor.name}
                  </AppText>
                  <AppText variant="caption">{selected.vendor.tagline}</AppText>
                </span>
                <Icon name="chevron-forward" size={20} color={colors.textSubtle} />
              </button>
            ) : (
              <div className="booth-sheet-row">
                <span className="icon-tile icon-tile-round" style={{ backgroundColor: colors.surfaceAlt }}>
                  <Icon name="storefront-outline" size={22} color={colors.tertiary} />
                </span>
                <span style={{ flex: 1 }}>
                  <AppText variant="h3" as="span" style={{ display: 'block' }}>
                    {selected.code}
                  </AppText>
                  <AppText variant="caption">No vendor assigned to this booth{selected.zone ? ` · ${selected.zone}` : ''}</AppText>
                </span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

import { useRef, useState } from 'react';
import { getErrorMessage } from '@/api/client';
import { useMe, useUpdateLocation } from '@/api/hooks';
import type { UserLocation } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { LocationMap, type LocationMapHandle } from '@/components/LocationMap';
import { Header, Screen, useGoBack } from '@/components/Screen';
import { Card } from '@/components/ui';
import { colors } from '@/theme';
import { showAlert } from '@/utils/alert';

const CAIRO: UserLocation = { lat: 30.0444, lng: 31.2357, city: 'Cairo', country: 'Egypt' };

/** Reverse-geocodes with OpenStreetMap Nominatim; falls back to raw coordinates. */
async function describe(lat: number, lng: number): Promise<UserLocation> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as {
      address?: Record<string, string | undefined>;
    };
    const a = data.address ?? {};
    return {
      lat,
      lng,
      city: a.city ?? a.town ?? a.village ?? a.suburb ?? a.state ?? 'Unknown area',
      country: a.country ?? '',
      address: [a.house_number, a.road, a.neighbourhood ?? a.suburb].filter(Boolean).join(' ') || undefined,
    };
  } catch {
    return { lat, lng, city: `${lat.toFixed(3)}, ${lng.toFixed(3)}`, country: '' };
  }
}

function currentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Your browser does not support location.'));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 15000 });
  });
}

export default function LocationPage() {
  const goBack = useGoBack('/');
  const { data: me } = useMe();
  const update = useUpdateLocation();
  const mapRef = useRef<LocationMapHandle>(null);
  // The pin the user has moved to, if any; otherwise show their saved location.
  const [picked, setPicked] = useState<UserLocation>();
  const location = picked ?? me?.location ?? CAIRO;
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const lookup = useRef(0);

  const moveTo = async (lat: number, lng: number, animate = true) => {
    if (animate) mapRef.current?.animateTo({ lat, lng });
    setPicked({ ...location, lat, lng });
    setResolving(true);
    // Only the latest pin drop wins if several lookups overlap.
    const ticket = ++lookup.current;
    const place = await describe(lat, lng);
    if (ticket !== lookup.current) return;
    setPicked(place);
    setResolving(false);
  };

  const useCurrent = async () => {
    setLocating(true);
    try {
      const pos = await currentPosition();
      await moveTo(pos.coords.latitude, pos.coords.longitude);
    } catch (e) {
      const denied = (e as GeolocationPositionError)?.code === 1;
      showAlert(
        'Location',
        denied ? 'Allow location access for this site in your browser, or drop the pin manually on the map.' : getErrorMessage(e),
      );
    } finally {
      setLocating(false);
    }
  };

  const save = () =>
    update.mutate(location, {
      onSuccess: goBack,
      onError: (e) => showAlert('Could not update location', getErrorMessage(e)),
    });

  return (
    <Screen width="wide" header={<Header title="Update Location" />}>
      <div className="location-layout">
        <div className="location-map-wrap">
          <LocationMap ref={mapRef} point={location} onPick={({ lat, lng }) => moveTo(lat, lng, false)} />
        </div>

        <Card className="stack location-panel" style={{ gap: 8 }}>
          <AppText variant="caption">Selected location</AppText>
          <div className="row" style={{ gap: 8 }}>
            <Icon name="location" size={20} color={colors.secondary} />
            <div style={{ flex: 1 }} aria-live="polite">
              <AppText variant="h3" as="p">
                {resolving ? 'Finding address…' : [location.city, location.country].filter(Boolean).join(', ')}
              </AppText>
              {location.address && !resolving ? <AppText variant="caption">{location.address}</AppText> : null}
            </div>
          </div>
          <AppText variant="caption">Click the map or drag the pin to adjust.</AppText>
          <Button
            title={locating ? 'Locating…' : 'Use my current location'}
            icon="locate"
            variant="outline"
            onPress={useCurrent}
            disabled={locating}
            style={{ marginTop: 8 }}
          />
          <Button title="Update Location" onPress={save} loading={update.isPending} disabled={resolving} />
        </Card>
      </div>
    </Screen>
  );
}

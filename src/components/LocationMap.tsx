import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { GeoPoint } from '@/api/types';
import { colors } from '@/theme';

export interface LocationMapHandle {
  animateTo: (point: GeoPoint) => void;
}

interface LocationMapProps {
  point: GeoPoint;
  onPick: (point: GeoPoint) => void;
}

// A CSS pin instead of Leaflet's default PNG marker, which needs extra bundler setup.
const pinIcon = L.divIcon({
  className: '',
  html: `<span class="map-pin" style="--pin:${colors.secondary}"></span>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});

/** OpenStreetMap with a draggable pin; clicking the map moves the pin too. */
export const LocationMap = forwardRef<LocationMapHandle, LocationMapProps>(function LocationMap({ point, onPick }, ref) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!container.current) return;
    const m = L.map(container.current, { zoomControl: true }).setView([point.lat, point.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    const mk = L.marker([point.lat, point.lng], { draggable: true, icon: pinIcon, keyboard: true }).addTo(m);
    mk.on('dragend', () => {
      const { lat, lng } = mk.getLatLng();
      onPickRef.current({ lat, lng });
    });
    m.on('click', (e: L.LeafletMouseEvent) => onPickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }));
    map.current = m;
    marker.current = mk;
    // Leaflet measures its container once; re-measure whenever the layout changes its size.
    const resize = new ResizeObserver(() => m.invalidateSize());
    resize.observe(container.current);
    return () => {
      resize.disconnect();
      m.remove();
      map.current = null;
      marker.current = null;
    };
    // The map is created once; later point changes are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    marker.current?.setLatLng([point.lat, point.lng]);
  }, [point.lat, point.lng]);

  useImperativeHandle(ref, () => ({
    animateTo: ({ lat, lng }) => map.current?.flyTo([lat, lng], Math.max(map.current.getZoom(), 14), { duration: 0.5 }),
  }));

  return <div ref={container} className="location-map" />;
});

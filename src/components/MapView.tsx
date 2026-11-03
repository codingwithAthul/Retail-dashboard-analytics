import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { Competitor, LatLng, StoreListing } from '../data/types';

/** A store pin. Profiled stores get the large labelled pin; directory listings a small one. */
export type MapPin = Pick<StoreListing, 'id' | 'name' | 'shortName' | 'coords'> & {
  approximate?: boolean;
  profiled?: boolean;
};

export interface MapViewProps {
  stores: MapPin[];
  competitors?: Competitor[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Extra space (px) on the left, kept clear for the floating panel. */
  leftInset?: number;
  /** Extra space (px) at the top, kept clear for the top bar. */
  topInset?: number;
  /** Extra space (px) at the bottom, kept clear for a bottom sheet on phones. */
  bottomInset?: number;
  className?: string;
}

const prefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
const tileUrl = () =>
  `https://{s}.basemaps.cartocdn.com/${prefersDark() ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`;

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function storeIcon(store: MapPin, selected: boolean) {
  const label = `<div class="pin-label" aria-hidden="true">${escapeHtml(store.shortName)}</div>`;
  if (store.profiled === false) {
    return L.divIcon({
      className: '',
      html: `<div class="pin pin--listing${selected ? ' is-selected' : ''}" aria-hidden="true"></div>${selected ? label : ''}`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }
  return L.divIcon({
    className: '',
    html: `<div class="pin pin--store${selected ? ' is-selected' : ''}" aria-hidden="true"></div>${label}`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

const competitorIcon = L.divIcon({ className: '', html: '<div class="pin pin--competitor"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });

export function MapView({ stores, competitors = [], selectedId, onSelect, leftInset = 0, topInset = 96, bottomInset = 0, className }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: true });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer(tileUrl(), {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fit the view to the stores shown, so the map is always centred on them.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const points: LatLng[] = [...stores.map((s) => s.coords), ...competitors.map((c) => c.coords)];
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [leftInset + 48, topInset], paddingBottomRight: [48, bottomInset + 48], maxZoom: 16 });
  }, [stores, competitors, leftInset, topInset, bottomInset]);

  // Draw pins whenever the data or the selection changes.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const c of competitors) {
      L.marker(c.coords, { icon: competitorIcon, title: c.name, keyboard: false })
        .bindTooltip(`${c.name}${c.approximate ? ' (approximate location)' : ''}`)
        .addTo(layer);
    }
    for (const s of stores) {
      const selected = s.id === selectedId;
      const marker = L.marker(s.coords, {
        icon: storeIcon(s, selected),
        title: s.approximate ? `${s.name} (approximate location)` : s.name,
        riseOnHover: true,
        zIndexOffset: selected ? 1000 : s.profiled === false ? 0 : 500,
      })
        .on('click', () => onSelect?.(s.id))
        .addTo(layer);
      // Give keyboard and screen-reader users a clear name and state for each pin.
      const el = marker.getElement();
      // The name must include the visible label so voice control users can say what they see.
      el?.setAttribute('aria-label', s.name.includes(s.shortName) ? s.name : `${s.name}, ${s.shortName}`);
      el?.setAttribute('aria-pressed', String(s.id === selectedId));
    }
  }, [stores, competitors, selectedId, onSelect]);

  return <div ref={containerRef} className={className ?? 'map'} role="region" aria-label="Map of stores" />;
}

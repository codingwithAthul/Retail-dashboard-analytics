import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { Competitor, LatLng, Store } from '../data/types';

export interface MapViewProps {
  stores: Store[];
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

/**
 * OpenStreetMap's standard tiles: free and keyless. (CARTO's basemaps now answer
 * "API key required" without a key.) Colours are softened, and inverted in dark
 * appearance, by CSS on the tile pane: see map.css.
 */
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function storeIcon(store: Store, selected: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="pin pin--store${selected ? ' is-selected' : ''}" aria-hidden="true"></div><div class="pin-label" aria-hidden="true">${store.shortName}</div>`,
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
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map);
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
      const marker = L.marker(s.coords, { icon: storeIcon(s, s.id === selectedId), title: s.name, riseOnHover: true })
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

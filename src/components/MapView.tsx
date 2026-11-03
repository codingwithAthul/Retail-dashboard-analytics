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
  className?: string;
}

const prefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
const tileUrl = () =>
  `https://{s}.basemaps.cartocdn.com/${prefersDark() ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`;

function storeIcon(store: Store, selected: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="pin pin--store${selected ? ' is-selected' : ''}"><span>Rx</span></div><div class="pin-label">${store.shortName}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

const competitorIcon = L.divIcon({ className: '', html: '<div class="pin pin--competitor"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });

export function MapView({ stores, competitors = [], selectedId, onSelect, leftInset = 0, className }: MapViewProps) {
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
    map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [leftInset + 48, 96], paddingBottomRight: [48, 48], maxZoom: 16 });
  }, [stores, competitors, leftInset]);

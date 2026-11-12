import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { clusterPoints } from '../lib/cluster';
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
  /** Extra space (px) on the right, kept clear for a second floating panel. */
  rightInset?: number;
  /** Extra space (px) at the top, kept clear for the top bar. */
  topInset?: number;
  /** Extra space (px) at the bottom, kept clear for a bottom sheet on phones. */
  bottomInset?: number;
  /** Show the key that explains the pins. */
  legend?: boolean;
  className?: string;
}

/**
 * OpenStreetMap's standard tiles: free and keyless. (CARTO's basemaps now answer
 * "API key required" without a key.) Colours are softened, and inverted in dark
 * appearance, by CSS on the tile pane: see map.css.
 */
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function storeIcon(store: MapPin, selected: boolean) {
  const label = `<div class="pin-label" aria-hidden="true">${escapeHtml(store.shortName)}</div>`;
  if (store.profiled === false) {
    return L.divIcon({
      className: '',
      html: `<div class="pin pin--listing${selected ? ' is-selected' : ''}" aria-hidden="true"></div>${selected ? label : ''}`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }
  return L.divIcon({
    className: '',
    html: `<div class="pin pin--store${selected ? ' is-selected' : ''}" aria-hidden="true"></div>${label}`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

/** Pins closer than this many pixels are drawn as one cluster (keeps touch targets apart). */
const CLUSTER_RADIUS = 40;

function clusterIcon(count: number) {
  return L.divIcon({
    className: '',
    html: `<div class="pin pin--cluster" aria-hidden="true">${count}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const NO_COMPETITORS: Competitor[] = [];

/** What each kind of pin means. The grey row shows only while nearby places are on the map. */
export const LEGEND_ROWS = [
  { pin: 'store', mark: '', text: 'Profiled store, full analytics' },
  { pin: 'listing', mark: '', text: 'Shoppers Drug Mart store' },
  { pin: 'cluster', mark: '3', text: 'Stores grouped here; tap to zoom in' },
  { pin: 'competitor', mark: '', text: 'Nearby pharmacy or supermarket', competitors: true },
];

function legendControl(topInset: number) {
  const control = new L.Control({ position: 'topright' });
  control.onAdd = () => {
    const el = L.DomUtil.create('div', 'map-key');
    el.setAttribute('role', 'note');
    el.setAttribute('aria-label', 'Map key');
    el.style.marginTop = `${topInset}px`;
    // Open on wide screens; on phones it starts folded so it does not cover pins.
    const open = !window.matchMedia?.('(max-width: 760px)').matches;
    const rows = LEGEND_ROWS.map(
      (r) =>
        `<div class="map-key__row${r.competitors ? ' map-key__row--competitor' : ''}"><span class="map-key__pin"><span class="key-swatch key-swatch--${r.pin}" aria-hidden="true">${r.mark}</span></span><span>${r.text}</span></div>`,
    ).join('');
    el.innerHTML = `<details${open ? ' open' : ''}><summary>Map key</summary><div class="map-key__rows">${rows}</div></details>`;
    L.DomEvent.disableClickPropagation(el);
    return el;
  };
  return control;
}

const competitorIcon = L.divIcon({ className: '', html: '<div class="pin pin--competitor"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });

export function MapView({
  stores,
  competitors = NO_COMPETITORS,
  selectedId,
  onSelect,
  leftInset = 0,
  rightInset = 0,
  topInset = 96,
  bottomInset = 0,
  legend = false,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: true });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    map.on('zoomend', () => setZoom(map.getZoom()));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Controls on the right (key, zoom, credits) move left of a right-hand panel.
  useEffect(() => {
    containerRef.current?.style.setProperty('--map-right-inset', `${rightInset}px`);
  }, [rightInset]);

  // The key sits under the top bar, out of the way of the panel and the zoom buttons.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !legend) return;
    const control = legendControl(topInset).addTo(map);
    return () => {
      control.remove();
    };
  }, [legend, topInset]);

  // A selected directory store is zoomed to, because its neighbours are too close to tell
  // apart at city scale. Otherwise the view fits every store shown.
  const selectedListing = stores.find((s) => s.id === selectedId && s.profiled === false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selectedListing) {
      map.setView(selectedListing.coords, 15, { animate: false });
      map.panBy([(rightInset - leftInset) / 2, (bottomInset - topInset) / 2], { animate: false });
      return;
    }
    const points: LatLng[] = [...stores.map((s) => s.coords), ...competitors.map((c) => c.coords)];
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [leftInset + 48, topInset], paddingBottomRight: [rightInset + 48, bottomInset + 48], maxZoom: 16 });
  }, [stores, competitors, selectedListing, leftInset, rightInset, topInset, bottomInset]);

  // Draw pins whenever the data or the selection changes.
  useEffect(() => {
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    containerRef.current?.classList.toggle('map--with-nearby', competitors.length > 0);
    for (const c of competitors) {
      L.marker(c.coords, { icon: competitorIcon, title: c.name, keyboard: false })
        .bindTooltip(`${c.name}${c.approximate ? ' (approximate location)' : ''}`)
        .addTo(layer);
    }
    // Directory pins that would overlap at this zoom are grouped; profiled and selected stores always show.
    const loose = stores.filter((s) => s.profiled === false && s.id !== selectedId);
    const single = stores.filter((s) => !loose.includes(s));
    const z = zoom ?? map.getZoom();
    const groups = Number.isFinite(z)
      ? clusterPoints(
          loose.map((s) => {
            const { x, y } = map.project(s.coords, z);
            return { item: s, x, y };
          }),
          CLUSTER_RADIUS,
        )
      : loose.map((s) => ({ items: [s], x: 0, y: 0 }));
    for (const g of groups) {
      if (g.items.length === 1) {
        single.push(g.items[0]);
        continue;
      }
      const bounds = L.latLngBounds(g.items.map((s) => s.coords));
      const marker = L.marker(bounds.getCenter(), { icon: clusterIcon(g.items.length), title: `${g.items.length} stores` })
        .on('click', () => map.fitBounds(bounds.pad(0.5), { maxZoom: 17 }))
        .addTo(layer);
      const el = marker.getElement();
      el?.setAttribute('aria-label', `${g.items.length} stores: ${g.items.map((s) => s.shortName).join(', ')}. Zoom in`);
    }
    for (const s of single) {
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
  }, [stores, competitors, selectedId, onSelect, zoom]);

  return <div ref={containerRef} className={className ?? 'map'} role="region" aria-label="Map of stores" />;
}

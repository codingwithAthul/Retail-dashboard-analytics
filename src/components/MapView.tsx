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

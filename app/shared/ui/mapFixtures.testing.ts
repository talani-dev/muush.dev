import type { MapCopy } from '@/shared/data/mapCopy'

/**
 * Resolved map copy for the catalogue and the component tests (feature 44):
 * what `resolveMapCopy` hands `WorldMap` and `MapLegend` on `/es` and
 * `/en` (muush-1.0.md § 4.3, pen extract-44 § 2.1; the tab-list name and the
 * city names are Clarifications Q2, confirmed by Roberto 2026-11-01).
 * Fixtures only; the app never imports this file.
 */
export type MapFixtureLocale = 'es' | 'en'

export const MAP_COPY: Record<MapFixtureLocale, MapCopy> = {
  es: {
    regions: [
      { name: 'america', label: 'América' },
      { name: 'europe', label: 'Europa' },
    ],
    regionsLabel: 'Región del mapa',
    groups: [
      { kind: 'team', label: 'Equipo' },
      { kind: 'partner', label: 'Aliados' },
      { kind: 'soon', label: 'Estonia · pronto' },
    ],
    cityNames: {
      cdmx: 'CDMX',
      puebla: 'Puebla',
      merida: 'Mérida',
      dublin: 'Dublín',
      nyc: 'NYC',
      sanFrancisco: 'San Francisco',
      losAngeles: 'Los Ángeles',
      amsterdam: 'Ámsterdam',
      estonia: 'Estonia',
    },
    legend: [
      { kind: 'team', label: 'Equipo' },
      { kind: 'partner', label: 'Aliados' },
      { kind: 'none', label: 'Trabajamos con clientes en cualquier país.' },
    ],
    soonLabel: 'Estonia · pronto',
  },
  en: {
    regions: [
      { name: 'america', label: 'Americas' },
      { name: 'europe', label: 'Europe' },
    ],
    regionsLabel: 'Map region',
    groups: [
      { kind: 'team', label: 'Team' },
      { kind: 'partner', label: 'Partners' },
      { kind: 'soon', label: 'Estonia · soon' },
    ],
    cityNames: {
      cdmx: 'CDMX',
      puebla: 'Puebla',
      merida: 'Mérida',
      dublin: 'Dublin',
      nyc: 'NYC',
      sanFrancisco: 'San Francisco',
      losAngeles: 'Los Angeles',
      amsterdam: 'Amsterdam',
      estonia: 'Estonia',
    },
    legend: [
      { kind: 'team', label: 'Team' },
      { kind: 'partner', label: 'Partners' },
      { kind: 'none', label: 'We work with clients in any country.' },
    ],
    soonLabel: 'Estonia · soon',
  },
}

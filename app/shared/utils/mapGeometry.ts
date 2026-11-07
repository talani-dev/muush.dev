import type { MapPin } from '@/shared/data/mapPins'
import { MAP_SIZE } from '@/shared/data/mapPins'
import type { MapRegion } from '@/shared/data/mapRegions'

/**
 * Pure geometry of the dotted map (feature 44, research R4; data-model § 2).
 *
 * The map is drawn on a "canvas" box as wide as its window, at the map's
 * own 1408 : 470 proportion. Below `lg` the window has a fixed proportion
 * (`MAP_WINDOW_ASPECT`), so the handoff's measured contain-fit
 * (`iniciarMapa`: `s = min(W / w, H / h)`, centred) reduces to constants per
 * region, expressed relative to the canvas: a zoom over the canvas's own
 * scale and a translation in percent of the canvas box (`regionTransform`);
 * percentages hold at any width, so nothing is measured at runtime.
 *
 * Feature 50 (Roberto, 2026-11-06): CSS no longer applies that as
 * `translate + scale`. A scaled layer is rasterized at its unscaled size and
 * the bitmap is magnified, which is what blurred the dots on iPhone. The
 * same numbers are re-expressed as a frame in percent of the window
 * (`regionFrame`), so the canvas is laid out at its final size and the SVG
 * paints its dots there.
 */
export interface RegionTransform {
  zoom: number
  translateXPercent: number
  translateYPercent: number
}

const PERCENT = 100

export function regionTransform(
  region: MapRegion,
  windowAspect: number
): RegionTransform {
  const { width, height } = MAP_SIZE
  const zoom = Math.min(
    width / region.width,
    width / windowAspect / region.height
  )
  const windowHeightInCanvas = width / windowAspect / height
  const translateX =
    (1 - (region.width * zoom) / width) / 2 - (region.x * zoom) / width
  const translateY =
    (windowHeightInCanvas - (region.height * zoom) / height) / 2 -
    (region.y * zoom) / height
  return {
    zoom,
    translateXPercent: translateX * PERCENT,
    translateYPercent: translateY * PERCENT,
  }
}

/**
 * Where the zoomed canvas sits, in percent of the window box: its width
 * (`zoom` times the window's) and its top-left corner. `left` and `width`
 * resolve against the window's width, `top` against its height, so the
 * canvas-height translation is converted through both proportions. Every
 * map point lands where `regionTransform` puts it (feature 50).
 */
export interface RegionFrame {
  widthPercent: number
  leftPercent: number
  topPercent: number
}

export function regionFrame(
  region: MapRegion,
  windowAspect: number
): RegionFrame {
  const { zoom, translateXPercent, translateYPercent } = regionTransform(
    region,
    windowAspect
  )
  const canvasToWindowHeight = (MAP_SIZE.height / MAP_SIZE.width) * windowAspect
  return {
    widthPercent: zoom * PERCENT,
    leftPercent: translateXPercent,
    topPercent: translateYPercent * canvasToWindowHeight,
  }
}

/** A pin's centre in percent of the canvas box. */
export function pinPosition(pin: MapPin): {
  leftPercent: number
  topPercent: number
} {
  return {
    leftPercent: (pin.x / MAP_SIZE.width) * PERCENT,
    topPercent: (pin.y / MAP_SIZE.height) * PERCENT,
  }
}

export function isInRegion(pin: MapPin, region: MapRegion): boolean {
  return (
    pin.x >= region.x &&
    pin.x <= region.x + region.width &&
    pin.y >= region.y &&
    pin.y <= region.y + region.height
  )
}

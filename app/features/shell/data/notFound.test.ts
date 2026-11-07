import { describe, expect, it } from 'vitest'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import {
  NOT_FOUND_ASSESSMENT,
  NOT_FOUND_COPY_KEYS,
  NOT_FOUND_HOME,
  NOT_FOUND_ROBOTS,
} from './notFound'

describe('not-found content model', () => {
  it('should point the home at route index when read', () => {
    expect(NOT_FOUND_HOME).toEqual({
      labelKey: 'shell.notFound.cta',
      destination: { kind: 'route', name: 'index' },
    })
  })

  it('should point the assessment at the home diagnóstico anchor when read', () => {
    /* Feature 46 · FR-039. */
    expect(NOT_FOUND_ASSESSMENT).toEqual({
      labelKey: 'shell.notFound.assessment',
      destination: {
        kind: 'anchor',
        name: 'index',
        anchor: SECTION_ANCHORS.assessment,
      },
      track: {
        name: 'assessment_cta_click',
        params: { cta_location: 'not_found' },
      },
    })
  })

  it('should key the two-tone heading and keep the document title when read', () => {
    expect(NOT_FOUND_COPY_KEYS).toEqual({
      documentTitle: 'pages.notFound.title',
      headingFirst: 'shell.notFound.heading.first',
      headingSecond: 'shell.notFound.heading.second',
    })
  })

  it('should carry the reference robots value when read', () => {
    expect(NOT_FOUND_ROBOTS).toBe('noindex')
  })
})

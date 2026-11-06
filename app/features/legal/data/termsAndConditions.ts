import type { LegalPageModel } from './types'

/**
 * Términos y condiciones — the page's structure as i18n keys (feature 48;
 * `.pen` frames `dKb9C` / `K1aJhO` / `VvK17` / `T6ayk`). Same contract as
 * `privacyNotice.ts`: structure here, final legal text in `legal.terms.*`.
 */
export const TERMS_AND_CONDITIONS: LegalPageModel = {
  headingFirstKey: 'legal.terms.heading.first',
  headingSecondKey: 'legal.terms.heading.second',
  updatedKey: 'legal.terms.updated',
  sections: [
    {
      id: 'whoWeAre',
      navKey: 'legal.terms.sections.whoWeAre.nav',
      titleKey: 'legal.terms.sections.whoWeAre.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.terms.sections.whoWeAre.body' },
      ],
    },
    {
      id: 'usingTheSite',
      navKey: 'legal.terms.sections.usingTheSite.nav',
      titleKey: 'legal.terms.sections.usingTheSite.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.terms.sections.usingTheSite.body' },
      ],
    },
    {
      id: 'whatYouFind',
      navKey: 'legal.terms.sections.whatYouFind.nav',
      titleKey: 'legal.terms.sections.whatYouFind.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.terms.sections.whatYouFind.body' },
      ],
    },
    {
      id: 'assessment',
      navKey: 'legal.terms.sections.assessment.nav',
      titleKey: 'legal.terms.sections.assessment.title',
      blocks: [
        {
          kind: 'bullets',
          keys: [
            'legal.terms.sections.assessment.items.review',
            'legal.terms.sections.assessment.items.free',
            'legal.terms.sections.assessment.items.response',
            'legal.terms.sections.assessment.items.guidance',
          ],
        },
      ],
    },
    {
      id: 'projects',
      navKey: 'legal.terms.sections.projects.nav',
      titleKey: 'legal.terms.sections.projects.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.terms.sections.projects.body' },
      ],
    },
    {
      id: 'workWithUs',
      navKey: 'legal.terms.sections.workWithUs.nav',
      titleKey: 'legal.terms.sections.workWithUs.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.terms.sections.workWithUs.body' },
      ],
    },
    {
      id: 'properUse',
      navKey: 'legal.terms.sections.properUse.nav',
      titleKey: 'legal.terms.sections.properUse.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.terms.sections.properUse.body' },
      ],
    },
    {
      id: 'intellectualProperty',
      navKey: 'legal.terms.sections.intellectualProperty.nav',
      titleKey: 'legal.terms.sections.intellectualProperty.title',
      blocks: [
        {
          kind: 'paragraph',
          key: 'legal.terms.sections.intellectualProperty.body',
        },
        {
          kind: 'paragraph',
          key: 'legal.terms.sections.intellectualProperty.submissions',
        },
      ],
    },
    {
      id: 'thirdParties',
      navKey: 'legal.terms.sections.thirdParties.nav',
      titleKey: 'legal.terms.sections.thirdParties.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.terms.sections.thirdParties.body' },
      ],
    },
    {
      id: 'availability',
      navKey: 'legal.terms.sections.availability.nav',
      titleKey: 'legal.terms.sections.availability.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.terms.sections.availability.body' },
        {
          kind: 'paragraph',
          key: 'legal.terms.sections.availability.liability',
        },
      ],
    },
    {
      id: 'privacy',
      navKey: 'legal.terms.sections.privacy.nav',
      titleKey: 'legal.terms.sections.privacy.title',
      blocks: [{ kind: 'paragraph', key: 'legal.terms.sections.privacy.body' }],
    },
    {
      id: 'changes',
      navKey: 'legal.terms.sections.changes.nav',
      titleKey: 'legal.terms.sections.changes.title',
      blocks: [{ kind: 'paragraph', key: 'legal.terms.sections.changes.body' }],
    },
    {
      id: 'governingLaw',
      navKey: 'legal.terms.sections.governingLaw.nav',
      titleKey: 'legal.terms.sections.governingLaw.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.terms.sections.governingLaw.body' },
      ],
    },
    {
      id: 'contact',
      navKey: 'legal.terms.sections.contact.nav',
      titleKey: 'legal.terms.sections.contact.title',
      blocks: [{ kind: 'paragraph', key: 'legal.terms.sections.contact.body' }],
    },
  ],
}

import type { LegalPageModel } from './types'

/**
 * Aviso de privacidad — the page's structure as i18n keys (feature 48;
 * `.pen` frames `rhgZ2` / `XlC2V` / `XaxDq` / `n76gJ3`). Order, section
 * boundaries and block kinds are the `.pen`'s; the text is the final legal
 * text Roberto approved on 2026-11-05 and lives only in the locale files
 * (`legal.privacy.*`). Section ids are the in-page anchors of the index.
 *
 * "Cookies y píxeles" ends with the "Cambiar mis preferencias" button
 * (`preferences`), which reopens the cookie preferences.
 *
 * Feature 49 (copy-drafts §§ A3, A7, approved by Roberto 2026-11-07) adds
 * two bullets: the Google Analytics purpose before the advertising one, and
 * Google after Meta in "Con quién los compartimos".
 */
export const PRIVACY_NOTICE: LegalPageModel = {
  headingFirstKey: 'legal.privacy.heading.first',
  headingSecondKey: 'legal.privacy.heading.second',
  updatedKey: 'legal.privacy.updated',
  sections: [
    {
      id: 'controller',
      navKey: 'legal.privacy.sections.controller.nav',
      titleKey: 'legal.privacy.sections.controller.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.privacy.sections.controller.body' },
      ],
    },
    {
      id: 'data',
      navKey: 'legal.privacy.sections.data.nav',
      titleKey: 'legal.privacy.sections.data.title',
      blocks: [
        {
          kind: 'table',
          rows: [
            {
              whereKey: 'legal.privacy.sections.data.table.assessment.where',
              dataKey: 'legal.privacy.sections.data.table.assessment.data',
            },
            {
              whereKey: 'legal.privacy.sections.data.table.application.where',
              dataKey: 'legal.privacy.sections.data.table.application.data',
            },
            {
              whereKey: 'legal.privacy.sections.data.table.call.where',
              dataKey: 'legal.privacy.sections.data.table.call.data',
            },
            {
              whereKey: 'legal.privacy.sections.data.table.browsing.where',
              dataKey: 'legal.privacy.sections.data.table.browsing.data',
            },
          ],
        },
        { kind: 'paragraph', key: 'legal.privacy.sections.data.sensitive' },
      ],
    },
    {
      id: 'purposes',
      navKey: 'legal.privacy.sections.purposes.nav',
      titleKey: 'legal.privacy.sections.purposes.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.privacy.sections.purposes.intro' },
        {
          kind: 'bullets',
          keys: [
            'legal.privacy.sections.purposes.items.assessment',
            'legal.privacy.sections.purposes.items.application',
            'legal.privacy.sections.purposes.items.both',
          ],
        },
        {
          kind: 'paragraph',
          key: 'legal.privacy.sections.purposes.additionalIntro',
        },
        {
          kind: 'bullets',
          keys: [
            'legal.privacy.sections.purposes.additionalItems.analytics',
            'legal.privacy.sections.purposes.additionalItems.advertising',
          ],
        },
        { kind: 'paragraph', key: 'legal.privacy.sections.purposes.objection' },
      ],
    },
    {
      id: 'sharing',
      navKey: 'legal.privacy.sections.sharing.nav',
      titleKey: 'legal.privacy.sections.sharing.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.privacy.sections.sharing.intro' },
        {
          kind: 'bullets',
          keys: [
            'legal.privacy.sections.sharing.items.providers',
            'legal.privacy.sections.sharing.items.meta',
            'legal.privacy.sections.sharing.items.google',
            'legal.privacy.sections.sharing.items.collaborators',
            'legal.privacy.sections.sharing.items.authorities',
          ],
        },
        { kind: 'paragraph', key: 'legal.privacy.sections.sharing.talentPool' },
        { kind: 'paragraph', key: 'legal.privacy.sections.sharing.transfers' },
      ],
    },
    {
      id: 'retention',
      navKey: 'legal.privacy.sections.retention.nav',
      titleKey: 'legal.privacy.sections.retention.title',
      blocks: [
        {
          kind: 'bullets',
          keys: [
            'legal.privacy.sections.retention.items.cv',
            'legal.privacy.sections.retention.items.requests',
            'legal.privacy.sections.retention.items.clients',
            'legal.privacy.sections.retention.items.browsing',
          ],
        },
        {
          kind: 'paragraph',
          key: 'legal.privacy.sections.retention.earlyDeletion',
        },
      ],
    },
    {
      id: 'rights',
      navKey: 'legal.privacy.sections.rights.nav',
      titleKey: 'legal.privacy.sections.rights.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.privacy.sections.rights.intro' },
        { kind: 'paragraph', key: 'legal.privacy.sections.rights.howTo' },
        {
          kind: 'steps',
          keys: [
            'legal.privacy.sections.rights.steps.contact',
            'legal.privacy.sections.rights.steps.identification',
            'legal.privacy.sections.rights.steps.request',
            'legal.privacy.sections.rights.steps.documents',
          ],
        },
        { kind: 'paragraph', key: 'legal.privacy.sections.rights.response' },
      ],
    },
    {
      id: 'withdrawal',
      navKey: 'legal.privacy.sections.withdrawal.nav',
      titleKey: 'legal.privacy.sections.withdrawal.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.privacy.sections.withdrawal.body' },
      ],
    },
    {
      id: 'cookies',
      navKey: 'legal.privacy.sections.cookies.nav',
      titleKey: 'legal.privacy.sections.cookies.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.privacy.sections.cookies.body' },
        { kind: 'paragraph', key: 'legal.privacy.sections.cookies.choices' },
        {
          kind: 'preferences',
          key: 'legal.privacy.sections.cookies.preferences',
        },
      ],
    },
    {
      id: 'changes',
      navKey: 'legal.privacy.sections.changes.nav',
      titleKey: 'legal.privacy.sections.changes.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.privacy.sections.changes.body' },
      ],
    },
    {
      id: 'authority',
      navKey: 'legal.privacy.sections.authority.nav',
      titleKey: 'legal.privacy.sections.authority.title',
      blocks: [
        { kind: 'paragraph', key: 'legal.privacy.sections.authority.body' },
      ],
    },
  ],
}

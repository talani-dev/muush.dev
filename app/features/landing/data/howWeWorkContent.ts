/**
 * "Cómo trabajamos" content model (feature 44, data-model §§ 4–5; copy in
 * `docs/business/muush-1.0.md` § 4.5, icons in pen extract-44 § 4). Step
 * 01 also has a short description, shown below `lg` (Roberto, 2026-11-01,
 * pen extract-44 § 7).
 */
export type StepIcon =
  | 'message-circle-warning'
  | 'sliders-horizontal'
  | 'user-round'
  | 'file-text'
  | 'key-round'

export type StepKey = 'assessment' | 'proposal' | 'design' | 'build' | 'launch'

export interface ProcessStepModel {
  key: StepKey
  number: '01' | '02' | '03' | '04' | '05'
  icon: StepIcon
  hasShort: boolean
}

export const PROCESS_STEPS: readonly ProcessStepModel[] = [
  {
    key: 'assessment',
    number: '01',
    icon: 'message-circle-warning',
    hasShort: true,
  },
  {
    key: 'proposal',
    number: '02',
    icon: 'sliders-horizontal',
    hasShort: false,
  },
  { key: 'design', number: '03', icon: 'user-round', hasShort: false },
  { key: 'build', number: '04', icon: 'file-text', hasShort: false },
  { key: 'launch', number: '05', icon: 'key-round', hasShort: false },
]

export const HOW_WE_WORK_KEYS = {
  pill: 'landing.howWeWork.pill',
  headingFirst: 'landing.howWeWork.heading.first',
  headingSecond: 'landing.howWeWork.heading.second',
  stepTitle: (key: StepKey) => `landing.howWeWork.steps.${key}.title`,
  stepDescription: (key: StepKey) =>
    `landing.howWeWork.steps.${key}.description`,
  stepDescriptionShort: (key: StepKey) =>
    `landing.howWeWork.steps.${key}.descriptionShort`,
  stepCommitment: (key: StepKey) => `landing.howWeWork.steps.${key}.commitment`,
} as const

export interface ProcessStepContent {
  number: string
  title: string
  description: string
  /** Below `lg` only; absent when the step has a single description. */
  descriptionShort?: string
  commitment: string
  icon: StepIcon
}

export interface HowWeWorkContent {
  pill: string
  headingFirst: string
  headingSecond: string
  steps: ProcessStepContent[]
}

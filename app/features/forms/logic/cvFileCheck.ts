import {
  CV_ACCEPTED_TYPE,
  CV_MAX_BYTES,
} from '@/features/forms/data/applicationFields'

/**
 * Whether a chosen CV may be kept (feature 45, research R7): a PDF of at
 * most `CV_MAX_BYTES` (5 242 880 bytes, `form-api-contract.md` § 4; Roberto
 * 2026-11-02). A file of exactly that size is accepted.
 *
 * One check for both CV fields (Constitution Article VIII): the v2
 * `CvField` and the quarantined v1 `FileField` call it on selection, so a
 * refused file never becomes a form value and nothing is sent for it.
 */
export type CvFileVerdict = 'accepted' | 'format' | 'size'

export function classifyCvFile(file: File): CvFileVerdict {
  if (file.type !== CV_ACCEPTED_TYPE) return 'format'
  if (file.size > CV_MAX_BYTES) return 'size'
  return 'accepted'
}

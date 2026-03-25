export type AssessmentStatus =
  | 'draft'
  | 'in_review'
  | 'published'
  | 'archived'

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  published: 'Published',
  archived: 'Archived',
}

export const ALLOWED_STATUS_TRANSITIONS: Record<AssessmentStatus, AssessmentStatus[]> = {
  draft: ['in_review'],
  in_review: ['draft', 'published'],
  published: ['archived'],
  archived: [],
}

export function canTransitionAssessmentStatus(
  current: AssessmentStatus,
  next: AssessmentStatus,
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[current]?.includes(next) ?? false
}

export function getAssessmentStatusLabel(status: AssessmentStatus): string {
  return ASSESSMENT_STATUS_LABELS[status] ?? 'Unknown'
}
import type { AssessmentStatus } from './assessment-status'

export function getCustomerAssessmentStatusMessage(status: AssessmentStatus): string {
  switch (status) {
    case 'draft':
    case 'in_review':
      return 'Your assessment is being finalized. Your report is not yet available.'
    case 'published':
      return 'Your assessment report is now available.'
    case 'archived':
      return 'This assessment has been archived.'
    default:
      return 'Assessment status unavailable.'
  }
}

export function canShowCustomerReportCta(status: AssessmentStatus): boolean {
  return status === 'published'
}
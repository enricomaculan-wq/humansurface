import { notFound, redirect } from 'next/navigation'
import type { AssessmentStatus } from './assessment-status'

type CustomerOwnedAssessment = {
  customerId?: string | null
  status: AssessmentStatus
}

export function assertCustomerOwnsAssessment(
  assessment: CustomerOwnedAssessment | null | undefined,
  authenticatedCustomerId: string | null | undefined,
): asserts assessment is CustomerOwnedAssessment {
  if (!assessment) {
    notFound()
  }

  if (!authenticatedCustomerId) {
    notFound()
  }

  if (!assessment.customerId || assessment.customerId !== authenticatedCustomerId) {
    notFound()
  }
}

export function assertCustomerCanAccessPublishedReport(
  assessment: CustomerOwnedAssessment | null | undefined,
  authenticatedCustomerId: string | null | undefined,
) {
  assertCustomerOwnsAssessment(assessment, authenticatedCustomerId)

  if (assessment.status !== 'published') {
    redirect('/dashboard')
  }
}

export function canCustomerAccessPublishedReport(
  assessment: CustomerOwnedAssessment | null | undefined,
  authenticatedCustomerId: string | null | undefined,
): boolean {
  if (!assessment) return false
  if (!authenticatedCustomerId) return false
  if (!assessment.customerId) return false
  if (assessment.customerId !== authenticatedCustomerId) return false

  return assessment.status === 'published'
}
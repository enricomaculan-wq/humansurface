import { runPublicScanForOrganization } from '@/lib/scanner/run-scan'
import { runExternalPublicScanForAssessment } from '@/lib/scanner/run-external-scan'

export async function runExposureAssessmentForOrganization(organizationId: string) {
  const websiteResult = await runPublicScanForOrganization(organizationId)

  const externalResult = await runExternalPublicScanForAssessment(
    websiteResult.assessmentId,
    organizationId
  )

  return {
    assessmentId: websiteResult.assessmentId,
    organizationId,
    website: websiteResult,
    external: externalResult,
  }
}

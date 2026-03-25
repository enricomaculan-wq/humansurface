import {
  validateAssessmentForPublish,
  type PublishableAssessment,
} from './assessment-publish-validation'

export async function publishAssessment(
  assessment: PublishableAssessment,
): Promise<
  | {
      ok: false
      status: 400
      validation: ReturnType<typeof validateAssessmentForPublish>
    }
  | {
      ok: true
      status: 200
      validation: ReturnType<typeof validateAssessmentForPublish>
      nextState: {
        status: 'published'
        publishedAt: string
        updatedAt: string
      }
    }
> {
  const validation = validateAssessmentForPublish(assessment)

  if (!validation.canPublish) {
    return {
      ok: false,
      status: 400,
      validation,
    }
  }

  const now = new Date().toISOString()

  return {
    ok: true,
    status: 200,
    validation,
    nextState: {
      status: 'published',
      publishedAt: now,
      updatedAt: now,
    },
  }
}
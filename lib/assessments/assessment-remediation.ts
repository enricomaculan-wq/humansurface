export type RemediationTask = {
  id: string
  assessment_id: string
  title: string
  priority: string
  effort: string
  impact: string
  status: string
  created_at?: string
}

function priorityRank(value: string) {
  switch ((value || '').toLowerCase()) {
    case 'critical':
      return 4
    case 'high':
      return 3
    case 'medium':
      return 2
    default:
      return 1
  }
}

export function getImmediateRecommendationsFromTasks(
  tasks: RemediationTask[],
  limit = 5,
): string[] {
  const openTasks = tasks.filter(
    (task) => (task.status || '').toLowerCase() !== 'done',
  )

  return openTasks
    .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
    .slice(0, limit)
    .map((task) => task.title.trim())
    .filter(Boolean)
}

export function hasOpenRemediationTasks(tasks: RemediationTask[]): boolean {
  return tasks.some((task) => (task.status || '').toLowerCase() !== 'done')
}
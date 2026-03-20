export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString('it-IT', {
    timeZone: 'Europe/Rome',
    dateStyle: 'short',
    timeStyle: 'medium',
  })
}
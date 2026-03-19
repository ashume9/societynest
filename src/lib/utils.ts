export function statusBadge(status: string): { label: string; className: string } {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'badge-yellow' },
    picked_up: { label: 'Picked Up', className: 'badge-blue' },
    in_progress: { label: 'In Progress', className: 'badge-orange' },
    ready: { label: 'Ready', className: 'badge-green' },
    delivered: { label: 'Delivered', className: 'badge-gray' },
  }
  return map[status] || { label: status, className: 'badge-gray' }
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

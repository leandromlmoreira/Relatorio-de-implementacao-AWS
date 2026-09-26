import technicalDoc from '../../../documentacao-tecnica.md?raw'

function capture(pattern: RegExp): string {
  const match = technicalDoc.match(pattern)
  if (!match) throw new Error(`Trecho não encontrado em documentacao-tecnica.md: ${pattern}`)
  return match[1].trim()
}

function field(label: string): string {
  return capture(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`))
}

function integer(value: string): number {
  return Number.parseInt(value.replace(/\D+/g, ' ').trim().split(' ')[0], 10)
}

export const docFacts = {
  autoScalingMin: integer(field('Mínimo')),
  autoScalingMax: integer(field('Máximo')),
  targetCpu: integer(field('Target')),
  cpuAlarm: integer(capture(/\*\*CPU Utilization\*\*\s*>\s*(\d+)%/)),
  rto: field('RTO'),
  rpo: field('RPO'),
  drRegion: field('Região de DR'),
  vpcCidr: field('VPC'),
  healthCheck: field('Health Check'),
}

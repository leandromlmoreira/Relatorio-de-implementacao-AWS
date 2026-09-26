import type { ServiceId } from '../../data/services'
import { escapeHtml } from '../../lib/dom'
import { glyph, type GlyphName } from './glyphs'
import type { Box } from './layouts'

interface NodeVisual {
  title: string
  subtitle: string
  glyph: GlyphName
  service?: ServiceId
}

const visuals: Record<string, NodeVisual> = {
  user: { title: 'Cliente', subtitle: 'navegador', glyph: 'user' },
  route53: { title: 'Route 53', subtitle: 'DNS', glyph: 'dns', service: 'route53' },
  cloudfront: { title: 'CloudFront', subtitle: 'CDN na borda', glyph: 'edge', service: 'cloudfront' },
  s3: { title: 'S3', subtitle: 'estáticos · backup', glyph: 'bucket', service: 's3' },
  alb: { title: 'Load Balancer', subtitle: 'ALB · HTTPS', glyph: 'balancer', service: 'alb' },
  rds: { title: 'RDS MySQL', subtitle: 'primário', glyph: 'database', service: 'rds' },
  standby: { title: 'RDS standby', subtitle: 'Multi-AZ', glyph: 'database', service: 'rds' },
  cloudwatch: { title: 'CloudWatch', subtitle: 'métricas · alarmes', glyph: 'monitor', service: 'cloudwatch' },
}

const compactSubtitles: Record<string, string> = {
  s3: 'estáticos',
}

function interactiveAttributes(node: string, visual: NodeVisual): string {
  if (!visual.service) return `data-node="${node}"`
  const label = escapeHtml(`${visual.title}, ${visual.subtitle}. Abrir detalhes`)
  return `data-node="${node}" data-service="${visual.service}" tabindex="0" role="button" aria-label="${label}"`
}

function frame(box: Box, content: string, attributes: string, extraClass = ''): string {
  const left = box.x - box.w / 2
  const top = box.y - box.h / 2
  return `
    <g class="node ${extraClass}" ${attributes} transform="translate(${left} ${top})">
      <rect class="node-hit" x="-6" y="-6" width="${box.w + 12}" height="${box.h + 12}" rx="18" />
      <g class="node-body" style="transform-origin: ${box.w / 2}px ${box.h / 2}px">
        <rect class="node-card" width="${box.w}" height="${box.h}" rx="14" />
        ${content}
      </g>
    </g>`
}

function cardContent(box: Box, visual: NodeVisual, subtitle: string): string {
  const well = 32
  const wellTop = (box.h - well) / 2
  return `
    <rect class="node-well" x="10" y="${wellTop}" width="${well}" height="${well}" rx="10" />
    ${glyph(visual.glyph, 20, 16, wellTop + 6)}
    <text class="node-title" x="52" y="${box.h / 2 - 3}">${escapeHtml(visual.title)}</text>
    <text class="node-sub" x="52" y="${box.h / 2 + 13}">${escapeHtml(subtitle)}</text>`
}

export function serviceNode(node: string, box: Box, compact: boolean): string {
  const visual = visuals[node]
  const subtitle = compact ? (compactSubtitles[node] ?? visual.subtitle) : visual.subtitle
  const extraClass = visual.service ? 'is-interactive' : 'is-static'
  return frame(box, cardContent(box, visual, subtitle), interactiveAttributes(node, visual), extraClass)
}

function instanceAttributes(index: number): string {
  const label = escapeHtml(`Instância EC2 ${index + 1}. Abrir detalhes do Auto Scaling`)
  return `data-node="ec2-${index}" data-instance="${index}" data-service="ec2" tabindex="0" role="button" aria-label="${label}"`
}

export function instanceCard(index: number, box: Box): string {
  const visual: NodeVisual = { title: `EC2 · ${index + 1}`, subtitle: 't3.medium', glyph: 'compute' }
  return frame(box, cardContent(box, visual, visual.subtitle), instanceAttributes(index), 'is-interactive is-instance')
}

export function instanceChip(index: number, box: Box): string {
  const content = `
    ${glyph('compute', 20, (box.w - 20) / 2, 11)}
    <text class="node-title node-title--center" x="${box.w / 2}" y="${box.h - 12}">${index + 1}</text>`
  return frame(box, content, instanceAttributes(index), 'is-interactive is-instance is-chip')
}

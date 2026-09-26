import { docFacts } from '../../data/doc-facts'
import { edgePath, routePath } from './geometry'
import { INSTANCE_SLOTS, type Box, type EdgeKind, type Layout, type Region } from './layouts'
import { instanceCard, instanceChip, serviceNode } from './nodes'

const SERVICE_NODES = ['user', 'route53', 'cloudfront', 's3', 'alb', 'rds', 'standby', 'cloudwatch']
const slots = Array.from({ length: INSTANCE_SLOTS }, (_, index) => index)

const withInstance = (hops: string[], index: number) => hops.map((hop) => (hop === 'ec2' ? `ec2-${index}` : hop))
const topLeft = (box: Box) => ({ left: box.x - box.w / 2, top: box.y - box.h / 2 })

function regionMarkup(region: Region): string {
  return `
    <rect class="region region--subnet" x="${region.x}" y="${region.y}" width="${region.w}" height="${region.h}" rx="18" />
    <text class="region-label" x="${region.x + 16}" y="${region.labelBottom ? region.y + region.h - 16 : region.y + 24}">${region.label}</text>`
}

function vpcMarkup(layout: Layout): string {
  const { vpc } = layout
  const tag = `${vpc.label} · ${docFacts.vpcCidr}`
  const tagWidth = tag.length * 7.1 + 26
  const tagX = layout.tagAlign === 'end' ? vpc.x + vpc.w - tagWidth - 16 : vpc.x + 16
  return `
    <rect class="region region--vpc" x="${vpc.x}" y="${vpc.y}" width="${vpc.w}" height="${vpc.h}" rx="26" />
    <g class="node node--tag is-interactive" data-service="vpc" tabindex="0" role="button" aria-label="VPC ${docFacts.vpcCidr}. Abrir detalhes" transform="translate(${tagX} ${vpc.y - 12})">
      <rect class="node-hit" x="-4" y="-4" width="${tagWidth + 8}" height="32" rx="14" />
      <g class="node-body" style="transform-origin: ${tagWidth / 2}px 12px">
        <rect class="node-card" width="${tagWidth}" height="24" rx="12" />
        <text class="tag-text" x="13" y="16">${tag}</text>
      </g>
    </g>`
}

function asgMarkup(layout: Layout): string {
  const { left, top } = topLeft(layout.asg)
  return `
    <rect class="region region--asg" x="${left}" y="${top}" width="${layout.asg.w}" height="${layout.asg.h}" rx="16" />
    <text class="region-label" x="${left + 14}" y="${top + 22}">Auto Scaling <tspan class="region-count" data-asg-count>1/${INSTANCE_SLOTS}</tspan></text>`
}

function edgeMarkup(layout: Layout, from: string, to: string, kind: EdgeKind, instance?: number): string {
  const instanceAttribute = instance === undefined ? '' : ` data-instance="${instance}"`
  return `<path class="edge edge--${kind}"${instanceAttribute} d="${edgePath(layout, from, to)}" />`
}

function pairs(hops: string[]): [string, string][] {
  return hops.slice(1).map((to, index) => [hops[index], to])
}

function edgesMarkup(layout: Layout): string {
  const drawn = new Set<string>()
  const markup: string[] = []
  const draw = (from: string, to: string, kind: EdgeKind, instance?: number) => {
    const key = `${from}>${to}`
    if (drawn.has(key)) return
    drawn.add(key)
    markup.push(edgeMarkup(layout, from, to, kind, instance))
  }
  slots.forEach((index) => pairs(withInstance(layout.requestRoute, index)).forEach(([from, to]) => draw(from, to, 'request', from.startsWith('ec2-') || to.startsWith('ec2-') ? index : undefined)))
  pairs(layout.staticRoute).forEach(([from, to]) => draw(from, to, 'static'))
  layout.metricRoutes.forEach((route) => pairs(route).forEach(([from, to]) => draw(from, to, 'metric')))
  draw(layout.replica[0], layout.replica[1], 'replica')
  return markup.join('')
}

function routesMarkup(layout: Layout): string {
  const requests = slots.map((index) => `<path data-route="request" data-instance="${index}" d="${routePath(layout, withInstance(layout.requestRoute, index))}" />`)
  const statics = `<path data-route="static" d="${routePath(layout, layout.staticRoute)}" />`
  const metrics = layout.metricRoutes.map((route) => `<path data-route="metric" d="${routePath(layout, route)}" />`)
  return [...requests, statics, ...metrics].join('')
}

function nodesMarkup(layout: Layout): string {
  const compact = layout.name === 'compact'
  const services = SERVICE_NODES.map((node) => serviceNode(node, layout.nodes[node], compact))
  const instances = slots.map((index) => {
    const box = layout.nodes[`ec2-${index}`]
    return layout.instanceVariant === 'chip' ? instanceChip(index, box) : instanceCard(index, box)
  })
  return [...services, ...instances].join('')
}

export function renderDiagram(layout: Layout): string {
  const patternId = `grid-${layout.name}`
  return `
    <svg class="diagram-svg diagram-svg--${layout.name}" viewBox="0 0 ${layout.width} ${layout.height}" role="group" aria-label="Diagrama da arquitetura: cliente, Route 53, CloudFront, Load Balancer, instâncias EC2 em Auto Scaling e RDS MySQL, com S3 e CloudWatch">
      <defs>
        <pattern id="${patternId}" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" class="grid-dot" />
        </pattern>
      </defs>
      <rect class="diagram-grid" width="${layout.width}" height="${layout.height}" fill="url(#${patternId})" />
      <g class="regions">
        ${vpcMarkup(layout)}
        ${layout.subnets.map(regionMarkup).join('')}
        ${asgMarkup(layout)}
      </g>
      <g class="edges">${edgesMarkup(layout)}</g>
      <g class="routes" aria-hidden="true">${routesMarkup(layout)}</g>
      <g class="packets" aria-hidden="true"></g>
      <g class="nodes">${nodesMarkup(layout)}</g>
    </svg>`
}

import type { Box, Layout, Link, Side } from './layouts'

interface Point {
  x: number
  y: number
}

const NORMALS: Record<Side, Point> = {
  l: { x: -1, y: 0 },
  r: { x: 1, y: 0 },
  t: { x: 0, y: -1 },
  b: { x: 0, y: 1 },
}

const round = (value: number) => Math.round(value * 10) / 10
const point = ({ x, y }: Point) => `${round(x)} ${round(y)}`

function anchor(box: Box, side: Side): Point {
  const normal = NORMALS[side]
  return { x: box.x + (normal.x * box.w) / 2, y: box.y + (normal.y * box.h) / 2 }
}

const familyOf = (id: string) => (id.startsWith('ec2-') ? 'ec2' : id)

function linkBetween(layout: Layout, from: string, to: string): Link {
  const link = layout.links.find((item) => item.from === familyOf(from) && item.to === familyOf(to))
  if (!link) throw new Error(`Ligação ausente no diagrama: ${from} → ${to}`)
  return link
}

function curve(layout: Layout, from: string, to: string): { start: Point; segment: string } {
  const link = linkBetween(layout, from, to)
  const [fromSide, toSide] = link.sides
  const start = anchor(layout.nodes[from], fromSide)
  const end = anchor(layout.nodes[to], toSide)
  const reach = link.bend ?? Math.max(22, Math.hypot(end.x - start.x, end.y - start.y) * 0.45)
  const startNormal = NORMALS[fromSide]
  const endNormal = NORMALS[toSide]
  const control1 = { x: start.x + startNormal.x * reach, y: start.y + startNormal.y * reach }
  const control2 = { x: end.x + endNormal.x * reach, y: end.y + endNormal.y * reach }
  return { start, segment: `C ${point(control1)} ${point(control2)} ${point(end)}` }
}

export function edgePath(layout: Layout, from: string, to: string): string {
  const { start, segment } = curve(layout, from, to)
  return `M ${point(start)} ${segment}`
}

export function routePath(layout: Layout, hops: string[]): string {
  const [first] = hops
  const parts: string[] = []
  hops.slice(1).forEach((to, index) => {
    const from = hops[index]
    const { start, segment } = curve(layout, from, to)
    if (index === 0) {
      parts.push(first === 'asg' ? `M ${point(start)}` : `M ${point(layout.nodes[first])} L ${point(start)}`)
    } else {
      parts.push(`L ${point(layout.nodes[from])} L ${point(start)}`)
    }
    parts.push(segment)
  })
  return parts.join(' ')
}

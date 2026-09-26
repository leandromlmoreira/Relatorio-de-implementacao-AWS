export type Side = 'l' | 'r' | 't' | 'b'
export type EdgeKind = 'request' | 'static' | 'metric' | 'replica'

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface Region extends Box {
  label: string
  labelBottom?: boolean
}

export interface Link {
  from: string
  to: string
  sides: [Side, Side]
  bend?: number
}

export interface Layout {
  name: 'wide' | 'compact'
  width: number
  height: number
  nodes: Record<string, Box>
  vpc: Region
  tagAlign: 'start' | 'end'
  subnets: Region[]
  asg: Box
  instanceVariant: 'card' | 'chip'
  links: Link[]
  staticRoute: string[]
  requestRoute: string[]
  metricRoutes: string[][]
  replica: [string, string]
}

export const INSTANCE_SLOTS = 5

function instanceNodes(place: (index: number) => Box): Record<string, Box> {
  return Object.fromEntries(Array.from({ length: INSTANCE_SLOTS }, (_, index) => [`ec2-${index}`, place(index)]))
}

const wideAsg: Box = { x: 858, y: 324, w: 212, h: 324 }

export const wideLayout: Layout = {
  name: 'wide',
  width: 1200,
  height: 556,
  nodes: {
    user: { x: 72, y: 338, w: 124, h: 60 },
    route53: { x: 248, y: 338, w: 150, h: 64 },
    cloudfront: { x: 424, y: 338, w: 150, h: 64 },
    s3: { x: 424, y: 478, w: 172, h: 58 },
    alb: { x: 636, y: 338, w: 150, h: 64 },
    rds: { x: 1072, y: 292, w: 160, h: 64 },
    standby: { x: 1072, y: 404, w: 160, h: 56 },
    cloudwatch: { x: 858, y: 44, w: 184, h: 56 },
    asg: wideAsg,
    ...instanceNodes((index) => ({ x: 858, y: 222 + index * 58, w: 178, h: 46 })),
  },
  vpc: { x: 530, y: 100, w: 652, h: 440, label: 'VPC' },
  tagAlign: 'start',
  subnets: [
    { x: 546, y: 128, w: 180, h: 396, label: 'Subnets públicas', labelBottom: true },
    { x: 738, y: 128, w: 428, h: 396, label: 'Subnets privadas', labelBottom: true },
  ],
  asg: wideAsg,
  instanceVariant: 'card',
  links: [
    { from: 'user', to: 'route53', sides: ['r', 'l'] },
    { from: 'route53', to: 'cloudfront', sides: ['r', 'l'] },
    { from: 'cloudfront', to: 'alb', sides: ['r', 'l'] },
    { from: 'cloudfront', to: 's3', sides: ['b', 't'] },
    { from: 'alb', to: 'ec2', sides: ['r', 'l'] },
    { from: 'ec2', to: 'rds', sides: ['r', 'l'] },
    { from: 'rds', to: 'standby', sides: ['b', 't'] },
    { from: 'asg', to: 'cloudwatch', sides: ['t', 'b'] },
    { from: 'rds', to: 'cloudwatch', sides: ['t', 'r'] },
  ],
  requestRoute: ['user', 'route53', 'cloudfront', 'alb', 'ec2', 'rds'],
  staticRoute: ['user', 'route53', 'cloudfront', 's3'],
  metricRoutes: [
    ['asg', 'cloudwatch'],
    ['rds', 'cloudwatch'],
  ],
  replica: ['rds', 'standby'],
}

const compactAsg: Box = { x: 180, y: 537, w: 296, h: 150 }
const compactSlot = compactAsg.w / INSTANCE_SLOTS

export const compactLayout: Layout = {
  name: 'compact',
  width: 360,
  height: 980,
  nodes: {
    user: { x: 180, y: 34, w: 132, h: 48 },
    route53: { x: 180, y: 118, w: 172, h: 52 },
    cloudfront: { x: 110, y: 206, w: 168, h: 52 },
    s3: { x: 286, y: 206, w: 116, h: 52 },
    alb: { x: 180, y: 362, w: 180, h: 52 },
    rds: { x: 180, y: 690, w: 180, h: 52 },
    standby: { x: 180, y: 790, w: 160, h: 48 },
    cloudwatch: { x: 180, y: 930, w: 184, h: 52 },
    asg: compactAsg,
    ...instanceNodes((index) => ({
      x: compactAsg.x - compactAsg.w / 2 + compactSlot * (index + 0.5),
      y: 562,
      w: 44,
      h: 60,
    })),
  },
  vpc: { x: 10, y: 258, w: 340, h: 600, label: 'VPC' },
  tagAlign: 'end',
  subnets: [
    { x: 22, y: 290, w: 316, h: 114, label: 'Subnets públicas' },
    { x: 22, y: 416, w: 316, h: 430, label: 'Subnets privadas' },
  ],
  asg: compactAsg,
  instanceVariant: 'chip',
  links: [
    { from: 'user', to: 'route53', sides: ['b', 't'] },
    { from: 'route53', to: 'cloudfront', sides: ['b', 't'] },
    { from: 'cloudfront', to: 's3', sides: ['r', 'l'] },
    { from: 'cloudfront', to: 'alb', sides: ['b', 't'] },
    { from: 'alb', to: 'ec2', sides: ['b', 't'] },
    { from: 'ec2', to: 'rds', sides: ['b', 't'] },
    { from: 'rds', to: 'standby', sides: ['b', 't'] },
    { from: 'asg', to: 'cloudwatch', sides: ['l', 'l'], bend: 30 },
    { from: 'standby', to: 'cloudwatch', sides: ['b', 't'] },
  ],
  requestRoute: ['user', 'route53', 'cloudfront', 'alb', 'ec2', 'rds'],
  staticRoute: ['user', 'route53', 'cloudfront', 's3'],
  metricRoutes: [
    ['asg', 'cloudwatch'],
    ['standby', 'cloudwatch'],
  ],
  replica: ['rds', 'standby'],
}

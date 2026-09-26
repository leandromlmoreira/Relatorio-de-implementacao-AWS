import { costSheet, findItem } from './cost-sheet'
import { roundCents } from './csv'
import { docFacts } from './doc-facts'

export const scalingRule = {
  ordersPerInstance: 2000,
  minInstances: docFacts.autoScalingMin,
  maxInstances: docFacts.autoScalingMax,
  targetCpu: docFacts.targetCpu,
  cpuAlarm: docFacts.cpuAlarm,
}

export const ordersRange = { min: 250, max: 14000, step: 250, initial: 1500 }

const productionInstance = findItem((item) => item.service === 'Amazon EC2' && item.config.includes('t3.medium'))
const instanceVolume = findItem((item) => item.service === 'Amazon EBS')

export const perInstanceMonthly = roundCents(productionInstance.monthly + instanceVolume.monthly)
export const scalingItems = [productionInstance, instanceVolume]

export interface Simulation {
  orders: number
  instances: number
  cpu: number
  saturated: boolean
  monthly: number
  annual: number
  extraMonthly: number
}

export function instancesFor(orders: number): number {
  const needed = Math.ceil(orders / scalingRule.ordersPerInstance)
  return Math.min(scalingRule.maxInstances, Math.max(scalingRule.minInstances, needed))
}

export function simulate(orders: number): Simulation {
  const instances = instancesFor(orders)
  const cpu = Math.round((scalingRule.targetCpu * orders) / (instances * scalingRule.ordersPerInstance))
  const extraMonthly = roundCents((instances - scalingRule.minInstances) * perInstanceMonthly)
  const monthly = roundCents(costSheet.monthlyTotal + extraMonthly)
  return {
    orders,
    instances,
    cpu,
    saturated: cpu > scalingRule.cpuAlarm,
    monthly,
    annual: roundCents(monthly * 12),
    extraMonthly,
  }
}

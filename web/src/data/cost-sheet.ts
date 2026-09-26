import rawSheet from '../../../analise-custos.csv?raw'
import { parseCsv, parseMoney, roundCents } from './csv'

export interface CostItem {
  service: string
  config: string
  monthly: number
  annual: number
  note: string
}

export interface OnPremItem {
  label: string
  firstYear: number
  recurring: number
  note: string
}

export interface CostSheet {
  items: CostItem[]
  monthlyTotal: number
  annualTotal: number
  onPrem: OnPremItem[]
  onPremAnnual: number
  onPremOneTime: number
}

const ON_PREM_MARKER = 'Economia vs On-Premises'

function isSummaryRow(label: string): boolean {
  return label.startsWith('TOTAL') || label.startsWith('ECONOMIA')
}

function toCostItem(row: string[]): CostItem {
  return {
    service: row[0],
    config: row[1],
    monthly: parseMoney(row[2]),
    annual: parseMoney(row[3]),
    note: row[4] ?? '',
  }
}

function toOnPremItem(row: string[]): OnPremItem {
  return {
    label: row[0],
    firstYear: parseMoney(row[1]),
    recurring: parseMoney(row[2]),
    note: row[3] ?? '',
  }
}

function sum(values: number[]): number {
  return roundCents(values.reduce((total, value) => total + value, 0))
}

function buildSheet(text: string): CostSheet {
  const rows = parseCsv(text).slice(1)
  const split = rows.findIndex((row) => row[0] === ON_PREM_MARKER)
  const awsRows = rows.slice(0, split).filter((row) => row[0] && !isSummaryRow(row[0]))
  const onPremRows = rows.slice(split + 1).filter((row) => row[0] && !isSummaryRow(row[0]))
  const items = awsRows.map(toCostItem)
  const onPrem = onPremRows.map(toOnPremItem)

  return {
    items,
    monthlyTotal: sum(items.map((item) => item.monthly)),
    annualTotal: sum(items.map((item) => item.annual)),
    onPrem,
    onPremAnnual: sum(onPrem.map((item) => item.recurring)),
    onPremOneTime: sum(onPrem.map((item) => Math.max(0, item.firstYear - item.recurring))),
  }
}

export const costSheet = buildSheet(rawSheet)

export function findItem(predicate: (item: CostItem) => boolean): CostItem {
  const item = costSheet.items.find(predicate)
  if (!item) throw new Error('Linha esperada não encontrada em analise-custos.csv')
  return item
}

export function itemsFor(services: string[]): CostItem[] {
  return costSheet.items.filter((item) => services.includes(item.service))
}

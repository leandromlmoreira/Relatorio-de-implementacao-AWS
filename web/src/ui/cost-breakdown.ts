import { costSheet, type CostItem } from '../data/cost-sheet'
import { escapeHtml } from '../lib/dom'
import { formatPercent, formatPercentPrecise, formatUsd } from '../lib/format'

const shortName = (service: string) => service.replace(/^Amazon /, '')

function rowMarkup(item: CostItem, index: number, max: number): string {
  const share = item.monthly / costSheet.monthlyTotal
  const scale = max === 0 ? 0 : item.monthly / max
  return `
    <li class="bar-row" style="--row: ${index}" tabindex="0" aria-label="${escapeHtml(`${item.service}, ${item.config}: ${formatUsd(item.monthly)} por mês, ${formatPercentPrecise(share)} do total`)}">
      <div class="bar-row-text">
        <span class="bar-row-name">${escapeHtml(shortName(item.service))}</span>
        <span class="bar-row-config">${escapeHtml(item.config)}</span>
      </div>
      <div class="bar-row-track" aria-hidden="true">
        <span class="bar-row-fill" style="--scale: ${scale.toFixed(4)}"></span>
      </div>
      <div class="bar-row-values">
        <span class="bar-row-value">${formatUsd(item.monthly)}</span>
        <span class="bar-row-share">${formatPercentPrecise(share)}</span>
      </div>
    </li>`
}

function shareOf(services: string[]): number {
  const total = costSheet.items.filter((item) => services.includes(item.service)).reduce((sum, item) => sum + item.monthly, 0)
  return total / costSheet.monthlyTotal
}

export function costInsight(): string {
  const delivery = formatPercent(shareOf(['Amazon Data Transfer', 'Amazon CloudFront']))
  const compute = formatPercent(shareOf(['Amazon EC2', 'Amazon EBS']))
  return `As ${costSheet.items.length} linhas de analise-custos.csv, lidas no build e ordenadas pelo peso na conta. Entregar conteúdo (transferência e CDN) custa ${delivery} do total; a computação, ${compute}.`
}

export function renderCostBreakdown(): string {
  const sorted = [...costSheet.items].sort((a, b) => b.monthly - a.monthly)
  const max = sorted[0]?.monthly ?? 0
  return `
    <div class="breakdown">
      <div class="breakdown-head" aria-hidden="true">
        <span>Serviço e configuração</span>
        <span>Custo mensal</span>
      </div>
      <ol class="bar-list">${sorted.map((item, index) => rowMarkup(item, index, max)).join('')}</ol>
      <div class="breakdown-total">
        <span>Total mensal · ${costSheet.items.length} linhas da planilha</span>
        <strong>${formatUsd(costSheet.monthlyTotal)}</strong>
      </div>
    </div>`
}

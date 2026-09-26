import { costSheet, type OnPremItem } from '../data/cost-sheet'
import { roundCents } from '../data/csv'
import type { Simulation } from '../data/scaling'
import { escapeHtml, query } from '../lib/dom'
import { formatPercent, formatUsd, formatUsdRounded } from '../lib/format'
import type { Store } from '../lib/store'

interface Bar {
  key: 'onprem' | 'aws'
  title: string
  detail: string
  value: number
  lines: [string, string][]
}

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
const isAdmin = (item: OnPremItem) => item.label.toLowerCase().includes('administrador')

function niceStep(max: number): number {
  const raw = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normalized = raw / magnitude
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  return factor * magnitude
}

function domainFor(max: number): { top: number; ticks: number[] } {
  const step = niceStep(max)
  const top = Math.ceil((max * 1.08) / step) * step
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step)
  return { top, ticks }
}

function onPremBar(includeAdmin: boolean): Bar {
  const items = costSheet.onPrem.filter((item) => item.recurring > 0 && (includeAdmin || !isAdmin(item)))
  const oneTime: [string, string] = ['Compra do servidor (única, fora da barra)', formatUsd(costSheet.onPremOneTime)]
  return {
    key: 'onprem',
    title: 'On-premises',
    detail: includeAdmin ? 'manutenção, energia e administrador de TI, por ano' : 'manutenção e energia, por ano',
    value: roundCents(items.reduce((total, item) => total + item.recurring, 0)),
    lines: [...items.map((item): [string, string] => [item.label, formatUsd(item.recurring)]), oneTime],
  }
}

function awsBar(simulation: Simulation): Bar {
  const plural = simulation.instances === 1 ? 'instância' : 'instâncias'
  return {
    key: 'aws',
    title: 'AWS',
    detail: `12 meses com ${simulation.instances} ${plural} EC2`,
    value: simulation.annual,
    lines: [
      ['Custo mensal', formatUsd(simulation.monthly)],
      ['Meses', '12'],
      ['Instâncias EC2', String(simulation.instances)],
    ],
  }
}

function rowShell(key: Bar['key']): string {
  return `
    <div class="cmp-row" data-bar="${key}">
      <div class="cmp-row-label">
        <span class="cmp-row-title"></span>
        <span class="cmp-row-detail"></span>
      </div>
      <div class="cmp-track" tabindex="0">
        <span class="cmp-bar cmp-bar--${key}"></span>
        <span class="cmp-value-rail"><span class="cmp-value"></span></span>
      </div>
    </div>`
}

function updateRow(row: HTMLElement, bar: Bar, top: number): void {
  const ratio = bar.value / top
  const track = query<HTMLElement>('.cmp-track', row)
  query<HTMLElement>('.cmp-row-title', row).textContent = bar.title
  query<HTMLElement>('.cmp-row-detail', row).textContent = bar.detail
  query<HTMLElement>('.cmp-bar', row).style.transform = `scaleX(${ratio.toFixed(4)})`
  query<HTMLElement>('.cmp-value-rail', row).style.transform = `translateX(${(ratio * 100).toFixed(2)}%)`
  query<HTMLElement>('.cmp-value', row).textContent = formatUsdRounded(bar.value)
  track.dataset.ratio = ratio.toFixed(4)
  track.setAttribute('aria-label', `${bar.title}: ${formatUsd(bar.value)} por ano`)
}

function axisMarkup(ticks: number[], top: number): string {
  const grid = ticks.map((tick) => `<span class="cmp-grid" style="left: ${(tick / top) * 100}%"></span>`).join('')
  const labels = ticks.map((tick) => `<span class="cmp-tick" style="left: ${(tick / top) * 100}%">${tick === 0 ? '0' : compact.format(tick)}</span>`).join('')
  return `<div class="cmp-grid-layer" aria-hidden="true">${grid}</div><div class="cmp-axis" aria-hidden="true">${labels}</div>`
}

function tableMarkup(bars: Bar[]): string {
  const rows = bars
    .flatMap((bar) => [
      `<tr class="is-group"><th scope="rowgroup" colspan="2">${bar.title} · ${formatUsd(bar.value)}/ano</th></tr>`,
      ...bar.lines.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`),
    ])
    .join('')
  return `<table class="data-table"><thead><tr><th scope="col">Item</th><th scope="col">Valor</th></tr></thead><tbody>${rows}</tbody></table>`
}

function fitValueLabels(plot: HTMLElement): void {
  plot.querySelectorAll<HTMLElement>('.cmp-track').forEach((track) => {
    const label = query<HTMLElement>('.cmp-value', track)
    const ratio = Number(track.dataset.ratio ?? 0)
    const room = track.clientWidth * (1 - ratio)
    track.classList.toggle('is-label-inside', room < label.offsetWidth + 14)
  })
}

function showTooltip(tooltip: HTMLElement, bar: Bar, track: HTMLElement, plot: HTMLElement): void {
  tooltip.replaceChildren()
  const value = document.createElement('strong')
  value.textContent = `${formatUsd(bar.value)} / ano`
  const title = document.createElement('span')
  title.className = 'cmp-tooltip-title'
  title.textContent = bar.title
  const list = document.createElement('dl')
  bar.lines.forEach(([label, amount]) => {
    const term = document.createElement('dt')
    term.textContent = label
    const detail = document.createElement('dd')
    detail.textContent = amount
    list.append(term, detail)
  })
  tooltip.append(value, title, list)
  const trackBox = track.getBoundingClientRect()
  const plotBox = plot.getBoundingClientRect()
  tooltip.style.transform = `translate(${Math.max(0, trackBox.left - plotBox.left)}px, ${trackBox.bottom - plotBox.top + 10}px)`
  tooltip.classList.add('is-visible')
}

export function mountComparison(host: HTMLElement, simulation: Store<Simulation>): void {
  host.innerHTML = `
    <div class="cmp-stats">
      <div class="stat stat--hero">
        <p class="stat-label" data-savings-label>Economia anual estimada</p>
        <p class="stat-value" data-savings></p>
        <p class="stat-foot" data-savings-share></p>
      </div>
      <div class="stat">
        <p class="stat-label">AWS em 12 meses</p>
        <p class="stat-value stat-value--small" data-aws></p>
      </div>
      <div class="stat">
        <p class="stat-label">On-premises por ano</p>
        <p class="stat-value stat-value--small" data-onprem></p>
      </div>
    </div>
    <figure class="cmp-figure">
      <div class="cmp-head">
        <figcaption>
          <span class="cmp-caption-title">Custo recorrente por ano, em dólares</span>
          <span class="cmp-caption-sub" data-caption-sub></span>
        </figcaption>
        <label class="switch">
          <input type="checkbox" data-include-admin checked />
          <span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span>
          <span class="switch-label">Incluir salário do administrador de TI</span>
        </label>
      </div>
      <div class="cmp-plot" data-plot></div>
      <div class="cmp-tooltip" role="tooltip" data-tooltip></div>
    </figure>
    <details class="table-view">
      <summary>Ver dados em tabela</summary>
      <div data-table></div>
    </details>`

  const plot = query<HTMLElement>('[data-plot]', host)
  const tooltip = query<HTMLElement>('[data-tooltip]', host)
  const toggle = query<HTMLInputElement>('[data-include-admin]', host)
  const figure = query<HTMLElement>('.cmp-figure', host)
  plot.innerHTML = `<div class="cmp-scale" data-scale></div><div class="cmp-rows">${rowShell('onprem')}${rowShell('aws')}</div>`
  const scale = query<HTMLElement>('[data-scale]', plot)
  let bars: Bar[] = []
  let currentTop = 0

  const render = () => {
    bars = [onPremBar(toggle.checked), awsBar(simulation.get())]
    const [onPrem, aws] = bars
    const { top, ticks } = domainFor(Math.max(onPrem.value, aws.value))
    const savings = roundCents(onPrem.value - aws.value)
    if (top !== currentTop) scale.innerHTML = axisMarkup(ticks, top)
    currentTop = top
    bars.forEach((bar) => updateRow(query<HTMLElement>(`[data-bar="${bar.key}"]`, plot), bar, top))
    const awsCheaper = savings >= 0
    host.classList.toggle('is-aws-pricier', !awsCheaper)
    query<HTMLElement>('[data-savings-label]', host).textContent = awsCheaper ? 'Economia anual estimada' : 'AWS custa a mais por ano'
    query<HTMLElement>('[data-savings]', host).textContent = formatUsd(Math.abs(savings))
    query<HTMLElement>('[data-savings-share]', host).textContent = awsCheaper
      ? `${formatPercent(savings / onPrem.value)} a menos que manter a estrutura própria`
      : 'Sem o salário, a estrutura própria sai mais barata. A economia vem da equipe.'
    query<HTMLElement>('[data-caption-sub]', host).textContent = `Linhas de analise-custos.csv. A compra do servidor (${formatUsd(costSheet.onPremOneTime)}, única) fica de fora; a barra da AWS acompanha o simulador.`
    query<HTMLElement>('[data-aws]', host).textContent = formatUsd(aws.value)
    query<HTMLElement>('[data-onprem]', host).textContent = formatUsd(onPrem.value)
    query<HTMLElement>('[data-table]', host).innerHTML = tableMarkup(bars)
    fitValueLabels(plot)
  }

  const hide = () => tooltip.classList.remove('is-visible')
  const reveal = (event: Event) => {
    const track = (event.target as Element).closest<HTMLElement>('.cmp-track')
    const key = track?.closest<HTMLElement>('[data-bar]')?.dataset.bar
    const bar = bars.find((item) => item.key === key)
    if (track && bar) showTooltip(tooltip, bar, track, figure)
  }

  plot.addEventListener('pointerover', reveal)
  plot.addEventListener('focusin', reveal)
  plot.addEventListener('pointerleave', hide)
  plot.addEventListener('focusout', hide)
  toggle.addEventListener('change', render)
  window.addEventListener('resize', () => fitValueLabels(plot))
  simulation.subscribe(render)
}

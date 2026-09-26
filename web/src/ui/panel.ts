import { itemsFor, type CostItem } from '../data/cost-sheet'
import { roundCents } from '../data/csv'
import { scalingItems, type Simulation } from '../data/scaling'
import { serviceById, type Service, type ServiceId } from '../data/services'
import { escapeHtml, query } from '../lib/dom'
import { formatPercentPrecise, formatUsd } from '../lib/format'
import { alertIcon, closeIcon } from '../lib/icons'
import { fileUrl } from '../lib/links'
import type { Store } from '../lib/store'

interface PanelOptions {
  selected: Store<ServiceId | null>
  simulation: Store<Simulation>
}

function multiplierFor(item: CostItem, service: Service, simulation: Simulation): number {
  return service.id === 'ec2' && scalingItems.includes(item) ? simulation.instances : 1
}

function costRows(service: Service, simulation: Simulation): string {
  return itemsFor(service.sheetServices)
    .map((item) => {
      const multiplier = multiplierFor(item, service, simulation)
      const badge = multiplier > 1 ? `<span class="cost-multiplier">× ${multiplier}</span>` : ''
      return `
        <li class="cost-row">
          <span class="cost-row-label">${escapeHtml(item.config)}${badge}</span>
          <span class="cost-row-value">${formatUsd(item.monthly * multiplier)}</span>
        </li>`
    })
    .join('')
}

function serviceMonthly(service: Service, simulation: Simulation): number {
  return roundCents(
    itemsFor(service.sheetServices).reduce((total, item) => total + item.monthly * multiplierFor(item, service, simulation), 0),
  )
}

function decisionsMarkup(service: Service): string {
  return service.decisions
    .map(
      (decision) => `
        <li>
          <p>${escapeHtml(decision.text)}</p>
          <a class="source-chip" href="${fileUrl(decision.source)}" target="_blank" rel="noreferrer">${escapeHtml(decision.source)}</a>
        </li>`,
    )
    .join('')
}

function reviewMarkup(service: Service): string {
  if (!service.review) return ''
  return `
    <div class="panel-review" role="note">
      <span class="panel-review-icon">${alertIcon}</span>
      <p><strong>Ponto de revisão.</strong> ${escapeHtml(service.review)}</p>
    </div>`
}

function panelContent(service: Service, simulation: Simulation): string {
  const monthly = serviceMonthly(service, simulation)
  const share = monthly / simulation.monthly
  const scaledNote =
    service.id === 'ec2' ? `<p class="panel-cost-note">Com ${simulation.instances} ${simulation.instances === 1 ? 'instância ativa' : 'instâncias ativas'} no simulador.</p>` : ''
  return `
    <header class="panel-head">
      <p class="eyebrow-text">${escapeHtml(service.kind)}</p>
      <h2 id="panel-title" tabindex="-1">${escapeHtml(service.name)}</h2>
      <p class="panel-role">${escapeHtml(service.role)}</p>
    </header>
    <section class="panel-block" aria-labelledby="panel-cost-title">
      <div class="panel-cost">
        <div>
          <h3 id="panel-cost-title" class="panel-label">Custo mensal</h3>
          <p class="panel-cost-value">${formatUsd(monthly)}</p>
        </div>
        <p class="panel-share"><span>${formatPercentPrecise(share)}</span> do total</p>
      </div>
      <div class="panel-share-track" aria-hidden="true"><span style="transform: scaleX(${Math.min(1, share).toFixed(4)})"></span></div>
      ${scaledNote}
      <ul class="cost-rows">${costRows(service, simulation)}</ul>
    </section>
    <section class="panel-block" aria-labelledby="panel-decisions-title">
      <h3 id="panel-decisions-title" class="panel-label">Decisões de arquitetura</h3>
      <ul class="decision-list">${decisionsMarkup(service)}</ul>
      ${reviewMarkup(service)}
    </section>`
}

export function mountPanel(root: HTMLElement, { selected, simulation }: PanelOptions): void {
  root.innerHTML = `
    <div class="panel-scrim" data-close></div>
    <aside class="panel" role="dialog" aria-modal="false" aria-labelledby="panel-title" aria-hidden="true">
      <button class="icon-button panel-close" type="button" data-close aria-label="Fechar painel">${closeIcon}</button>
      <div class="panel-body"></div>
    </aside>`

  const panel = query<HTMLElement>('.panel', root)
  const body = query<HTMLElement>('.panel-body', root)
  let returnFocus: HTMLElement | SVGElement | null = null

  const render = () => {
    const id = selected.get()
    if (id) body.innerHTML = panelContent(serviceById(id), simulation.get())
  }

  selected.subscribe((id) => {
    const open = id !== null
    root.classList.toggle('is-open', open)
    panel.setAttribute('aria-hidden', String(!open))
    panel.toggleAttribute('inert', !open)
    if (!open) {
      returnFocus?.focus()
      returnFocus = null
      return
    }
    if (!returnFocus) returnFocus = document.activeElement as HTMLElement | SVGElement | null
    render()
    body.scrollTop = 0
    query<HTMLElement>('#panel-title', body).focus({ preventScroll: true })
  })

  simulation.subscribe(() => {
    if (selected.get()) render()
  })

  document.addEventListener('click', (event) => {
    if (!selected.get() || !(event.target instanceof Element)) return
    const target = event.target
    const explicitClose = target.closest('[data-close]') !== null
    const outside = target.isConnected && !panel.contains(target) && !target.closest('[data-service], [data-simulator]')
    if (explicitClose || outside) selected.set(null)
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && selected.get()) selected.set(null)
  })
}

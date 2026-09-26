import type { Simulation } from '../../data/scaling'
import { ordersRange } from '../../data/scaling'
import type { ServiceId } from '../../data/services'
import { onMediaChange, prefersReducedMotion } from '../../lib/dom'
import type { Store } from '../../lib/store'
import { compactLayout, INSTANCE_SLOTS, wideLayout } from './layouts'
import { startPackets, type PacketEngine } from './packets'
import { renderDiagram } from './render'

interface DiagramOptions {
  simulation: Store<Simulation>
  selected: Store<ServiceId | null>
}

const COMPACT_QUERY = '(max-width: 760px)'

function packetsPerSecond(orders: number): number {
  return 0.7 + (orders / ordersRange.max) * 2.6
}

function applyInstances(svg: SVGSVGElement, active: number): void {
  svg.querySelectorAll<SVGElement>('[data-instance]').forEach((element) => {
    const idle = Number(element.dataset.instance) >= active
    element.classList.toggle('is-idle', idle)
    if (element.hasAttribute('tabindex')) element.setAttribute('tabindex', idle ? '-1' : '0')
  })
  const counter = svg.querySelector('[data-asg-count]')
  if (counter) counter.textContent = `${active}/${INSTANCE_SLOTS}`
}

function applySelection(svg: SVGSVGElement, selected: ServiceId | null): void {
  svg.querySelectorAll<SVGElement>('[data-service]').forEach((element) => {
    element.classList.toggle('is-selected', element.dataset.service === selected)
  })
}

function bindInteractions(host: HTMLElement, selected: Store<ServiceId | null>): void {
  const serviceFrom = (target: EventTarget | null) =>
    (target instanceof Element ? target.closest<SVGElement>('[data-service]') : null)?.dataset.service as ServiceId | undefined

  host.addEventListener('click', (event) => {
    const service = serviceFrom(event.target)
    if (service) selected.set(service)
  })
  host.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const service = serviceFrom(event.target)
    if (!service) return
    event.preventDefault()
    selected.set(service)
  })
}

export function mountDiagram(host: HTMLElement, { simulation, selected }: DiagramOptions): void {
  const reducedMotion = prefersReducedMotion()
  let engine: PacketEngine | null = null
  let svg: SVGSVGElement

  const render = (compact: boolean) => {
    engine?.destroy()
    host.innerHTML = renderDiagram(compact ? compactLayout : wideLayout)
    svg = host.querySelector('svg')!
    engine = startPackets(svg, reducedMotion)
    const current = simulation.get()
    applyInstances(svg, current.instances)
    applySelection(svg, selected.get())
    engine.setTraffic(packetsPerSecond(current.orders), current.instances)
  }

  render(onMediaChange(COMPACT_QUERY, render))
  bindInteractions(host, selected)

  simulation.subscribe((current) => {
    applyInstances(svg, current.instances)
    engine?.setTraffic(packetsPerSecond(current.orders), current.instances)
  })
  selected.subscribe((service) => applySelection(svg, service))
}

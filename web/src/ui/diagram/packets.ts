type RouteKind = 'request' | 'static' | 'metric'

interface Route {
  path: SVGPathElement
  length: number
  kind: RouteKind
  instance: number | null
}

interface Packet {
  element: SVGGElement
  route: Route
  startedAt: number
  duration: number
}

export interface PacketEngine {
  setTraffic: (perSecond: number, activeInstances: number) => void
  destroy: () => void
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const SPEED = { request: 250, static: 250, metric: 150 }
const STATIC_EVERY = 3
const STILL_POSITIONS = [0.18, 0.42, 0.66, 0.88]

function readRoutes(svg: SVGSVGElement): Route[] {
  return Array.from(svg.querySelectorAll<SVGPathElement>('[data-route]')).map((path) => ({
    path,
    length: path.getTotalLength(),
    kind: path.dataset.route as RouteKind,
    instance: path.dataset.instance === undefined ? null : Number(path.dataset.instance),
  }))
}

function createPacketElement(kind: RouteKind): SVGGElement {
  const group = document.createElementNS(SVG_NS, 'g')
  group.setAttribute('class', `packet packet--${kind}`)
  const halo = document.createElementNS(SVG_NS, 'circle')
  halo.setAttribute('class', 'packet-halo')
  halo.setAttribute('r', '9')
  const core = document.createElementNS(SVG_NS, 'circle')
  core.setAttribute('class', 'packet-core')
  core.setAttribute('r', kind === 'metric' ? '3.2' : '4.2')
  group.append(halo, core)
  return group
}

function place(element: SVGGElement, route: Route, progress: number): void {
  const { x, y } = route.path.getPointAtLength(progress * route.length)
  element.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`)
}

function ripple(layer: SVGGElement, route: Route): void {
  const ring = document.createElementNS(SVG_NS, 'circle')
  const { x, y } = route.path.getPointAtLength(route.length)
  ring.setAttribute('class', `packet-ripple packet-ripple--${route.kind}`)
  ring.setAttribute('cx', x.toFixed(1))
  ring.setAttribute('cy', y.toFixed(1))
  ring.setAttribute('r', '5')
  layer.append(ring)
  const animation = ring.animate(
    [
      { transform: 'scale(1)', opacity: 0.55 },
      { transform: 'scale(3.2)', opacity: 0 },
    ],
    { duration: 700, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
  )
  animation.onfinish = () => ring.remove()
}

function renderStill(layer: SVGGElement, routes: Route[]): void {
  const firstRequest = routes.find((route) => route.kind === 'request')
  const staticRoute = routes.find((route) => route.kind === 'static')
  const metricRoute = routes.find((route) => route.kind === 'metric')
  if (firstRequest) {
    STILL_POSITIONS.forEach((position) => {
      const element = createPacketElement('request')
      place(element, firstRequest, position)
      layer.append(element)
    })
  }
  ;[staticRoute, metricRoute].forEach((route) => {
    if (!route) return
    const element = createPacketElement(route.kind)
    place(element, route, 0.55)
    layer.append(element)
  })
}

export function startPackets(svg: SVGSVGElement, reducedMotion: boolean): PacketEngine {
  const layer = svg.querySelector<SVGGElement>('.packets')!
  const routes = readRoutes(svg)
  const packets: Packet[] = []
  let perSecond = 1
  let activeInstances = 1
  let requestCount = 0
  let nextRequestAt = 0
  let nextMetricAt = 0
  let frame = 0
  let visible = true

  if (reducedMotion) {
    renderStill(layer, routes)
    return { setTraffic: () => undefined, destroy: () => layer.replaceChildren() }
  }

  const launch = (route: Route, now: number) => {
    const element = createPacketElement(route.kind)
    layer.append(element)
    const packet = { element, route, startedAt: now, duration: (route.length / SPEED[route.kind]) * 1000 }
    place(element, route, 0)
    packets.push(packet)
  }

  const requestRoute = () => {
    const instance = requestCount % activeInstances
    return routes.find((route) => route.kind === 'request' && route.instance === instance)
  }

  const spawn = (now: number) => {
    if (now >= nextRequestAt) {
      const route = requestRoute()
      if (route) launch(route, now)
      requestCount++
      if (requestCount % STATIC_EVERY === 0) {
        const staticRoute = routes.find((item) => item.kind === 'static')
        if (staticRoute) launch(staticRoute, now + 120)
      }
      nextRequestAt = now + (1000 / perSecond) * (0.75 + Math.random() * 0.5)
    }
    if (now >= nextMetricAt) {
      const metrics = routes.filter((route) => route.kind === 'metric')
      launch(metrics[Math.floor(Math.random() * metrics.length)], now)
      nextMetricAt = now + 1300 + Math.random() * 900
    }
  }

  const advance = (now: number) => {
    for (let index = packets.length - 1; index >= 0; index--) {
      const packet = packets[index]
      const progress = (now - packet.startedAt) / packet.duration
      if (progress >= 1) {
        packet.element.remove()
        packets.splice(index, 1)
        ripple(layer, packet.route)
        continue
      }
      place(packet.element, packet.route, Math.max(0, progress))
    }
  }

  const tick = (now: number) => {
    spawn(now)
    advance(now)
    frame = requestAnimationFrame(tick)
  }

  const resume = () => {
    if (frame || !visible || document.hidden) return
    const now = performance.now()
    nextRequestAt = now
    nextMetricAt = now + 600
    frame = requestAnimationFrame(tick)
  }

  const pause = () => {
    cancelAnimationFrame(frame)
    frame = 0
    packets.splice(0).forEach((packet) => packet.element.remove())
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) resume()
    else pause()
  })
  observer.observe(svg)

  const onVisibility = () => (document.hidden ? pause() : resume())
  document.addEventListener('visibilitychange', onVisibility)
  resume()

  return {
    setTraffic(nextPerSecond, nextActive) {
      perSecond = nextPerSecond
      activeInstances = Math.max(1, nextActive)
    },
    destroy() {
      pause()
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      layer.replaceChildren()
    },
  }
}

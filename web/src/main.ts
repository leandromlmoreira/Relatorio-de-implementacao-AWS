import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/diagram.css'
import './styles/simulator.css'
import './styles/panel.css'
import './styles/costs.css'
import './styles/sections.css'
import { ordersRange, simulate, type Simulation } from './data/scaling'
import type { ServiceId } from './data/services'
import { query } from './lib/dom'
import { createStore } from './lib/store'
import { mountComparison } from './ui/comparison'
import { mountDiagram } from './ui/diagram'
import { renderPage } from './ui/page'
import { mountPanel } from './ui/panel'
import { mountReveal } from './ui/reveal'
import { mountSimulator } from './ui/simulator'
import { mountThemeToggle } from './ui/theme'

const app = query<HTMLDivElement>('#app')
app.innerHTML = renderPage()

const simulation = createStore<Simulation>(simulate(ordersRange.initial))
const selected = createStore<ServiceId | null>(null)

mountThemeToggle(query<HTMLButtonElement>('[data-theme-toggle]', app))
mountSimulator(query<HTMLElement>('[data-simulator]', app), simulation)
mountDiagram(query<HTMLElement>('[data-diagram]', app), { simulation, selected })
mountComparison(query<HTMLElement>('[data-comparison]', app), simulation)
mountPanel(query<HTMLElement>('[data-panel]', app), { selected, simulation })
mountReveal(app)

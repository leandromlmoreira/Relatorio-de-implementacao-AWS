import { ordersRange, perInstanceMonthly, scalingRule, simulate, type Simulation } from '../data/scaling'
import { query } from '../lib/dom'
import { formatInteger, formatUsd } from '../lib/format'
import { alertIcon, checkIcon } from '../lib/icons'
import type { Store } from '../lib/store'

const pips = Array.from({ length: scalingRule.maxInstances }, (_, index) => `<span class="pip" data-pip="${index}"></span>`).join('')
const percentOfScale = (cpu: number) => Math.min(100, cpu)

function ruleMarkup(): string {
  return `
    <p class="sim-rule">
      <span class="sim-rule-label">Regra de escala</span>
      1 instância t3.medium a cada <strong>${formatInteger(scalingRule.ordersPerInstance)} pedidos/dia</strong>, mantendo a CPU perto do alvo de ${scalingRule.targetCpu}%.
      Mínimo de ${scalingRule.minInstances} e máximo de ${scalingRule.maxInstances} instâncias, como na documentação.
      Cada instância extra soma ${formatUsd(perInstanceMonthly)}/mês (EC2 t3.medium + EBS 30 GB da planilha); as demais linhas ficam fixas.
    </p>`
}

function template(): string {
  return `
    <div class="sim">
      <div class="sim-control">
        <div class="sim-control-head">
          <label class="sim-label" for="orders-range">Pedidos por dia</label>
          <output class="sim-orders" for="orders-range" data-orders></output>
        </div>
        <input id="orders-range" class="range" type="range" min="${ordersRange.min}" max="${ordersRange.max}" step="${ordersRange.step}" value="${ordersRange.initial}" aria-describedby="sim-rule" />
        <div class="sim-scale" aria-hidden="true">
          <span>${formatInteger(ordersRange.min)}</span>
          <span>${formatInteger(scalingRule.ordersPerInstance * scalingRule.maxInstances)} · limite do grupo</span>
          <span>${formatInteger(ordersRange.max)}</span>
        </div>
      </div>
      <dl class="sim-readouts">
        <div class="readout">
          <dt>Instâncias EC2</dt>
          <dd><span class="readout-value" data-instances></span><span class="readout-unit">de ${scalingRule.maxInstances}</span></dd>
          <div class="pips" aria-hidden="true">${pips}</div>
        </div>
        <div class="readout">
          <dt>CPU estimada</dt>
          <dd><span class="readout-value" data-cpu></span></dd>
          <div class="meter" aria-hidden="true">
            <span class="meter-fill" data-cpu-fill></span>
            <span class="meter-mark" style="left: ${scalingRule.targetCpu}%"></span>
            <span class="meter-mark meter-mark--alarm" style="left: ${scalingRule.cpuAlarm}%"></span>
          </div>
        </div>
        <div class="readout readout--cost">
          <dt>Custo mensal</dt>
          <dd><span class="readout-value" data-monthly></span></dd>
          <p class="readout-delta" data-delta></p>
        </div>
      </dl>
      <p class="sim-status" data-status role="status"></p>
      <div id="sim-rule">${ruleMarkup()}</div>
    </div>`
}

function statusMarkup(current: Simulation): string {
  if (current.saturated) {
    return `${alertIcon}<span>Grupo no máximo de ${scalingRule.maxInstances} instâncias: a CPU passa do alarme de ${scalingRule.cpuAlarm}% do CloudWatch. Hora de revisar o tipo de instância.</span>`
  }
  return `${checkIcon}<span>Dentro da capacidade: o Auto Scaling segura a CPU em até ${scalingRule.targetCpu}%.</span>`
}

export function mountSimulator(host: HTMLElement, simulation: Store<Simulation>): void {
  host.innerHTML = template()
  const range = query<HTMLInputElement>('#orders-range', host)
  const orders = query<HTMLElement>('[data-orders]', host)
  const instances = query<HTMLElement>('[data-instances]', host)
  const cpu = query<HTMLElement>('[data-cpu]', host)
  const cpuFill = query<HTMLElement>('[data-cpu-fill]', host)
  const monthly = query<HTMLElement>('[data-monthly]', host)
  const delta = query<HTMLElement>('[data-delta]', host)
  const status = query<HTMLElement>('[data-status]', host)
  let saturated: boolean | null = null
  const pipElements = Array.from(host.querySelectorAll<HTMLElement>('[data-pip]'))

  range.addEventListener('input', () => simulation.set(simulate(Number(range.value))))

  simulation.subscribe((current) => {
    const progress = (current.orders - ordersRange.min) / (ordersRange.max - ordersRange.min)
    range.style.setProperty('--progress', progress.toFixed(4))
    range.setAttribute('aria-valuetext', `${formatInteger(current.orders)} pedidos por dia, ${current.instances} instâncias`)
    orders.textContent = formatInteger(current.orders)
    instances.textContent = String(current.instances)
    cpu.textContent = `${current.cpu}%`
    cpuFill.style.transform = `scaleX(${percentOfScale(current.cpu) / 100})`
    monthly.textContent = formatUsd(current.monthly)
    delta.textContent = current.extraMonthly > 0 ? `+${formatUsd(current.extraMonthly)} sobre a base da planilha` : 'Base da planilha, 1 instância'
    pipElements.forEach((pip, index) => pip.classList.toggle('is-on', index < current.instances))
    host.classList.toggle('is-saturated', current.saturated)
    if (saturated !== current.saturated) status.innerHTML = statusMarkup(current)
    saturated = current.saturated
  })
}

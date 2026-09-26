import { costSheet } from '../data/cost-sheet'
import { docFacts } from '../data/doc-facts'
import { formatPercent, formatUsd, formatUsdRounded } from '../lib/format'
import { arrowDown, arrowUpRight } from '../lib/icons'
import { repoUrl } from '../lib/links'

const hours = (value: string) => `${Number.parseInt(value, 10)} h`

export function renderFacts(): string {
  return `<dl class="facts" data-reveal>${factItems()}</dl>`
}

function factItems(): string {
  const savings = 1 - costSheet.annualTotal / costSheet.onPremAnnual
  const items = [
    { label: 'Custo mensal base', value: formatUsd(costSheet.monthlyTotal), note: `${costSheet.items.length} linhas da planilha` },
    { label: 'Economia anual', value: formatPercent(savings), note: 'contra estrutura própria' },
    { label: 'Auto Scaling', value: `${docFacts.autoScalingMin}–${docFacts.autoScalingMax}`, note: `instâncias, alvo de CPU ${docFacts.targetCpu}%` },
    { label: 'RTO · RPO', value: `${hours(docFacts.rto)} · ${hours(docFacts.rpo)}`, note: `recuperação em ${docFacts.drRegion}` },
  ]
  return items
    .map(
      (item) => `
        <div class="fact">
          <dt>${item.label}</dt>
          <dd>
            <span class="fact-value">${item.value}</span>
            <span class="fact-note">${item.note}</span>
          </dd>
        </div>`,
    )
    .join('')
}

export function renderHero(): string {
  return `
    <header class="hero" id="topo">
      <div class="hero-grid">
        <div class="hero-copy" data-reveal>
          <p class="eyebrow"><span class="eyebrow-pulse" aria-hidden="true"></span>Arquitetura de referência na AWS</p>
          <h1>A farmácia online que escala sozinha, a partir de <span class="h1-accent">${formatUsdRounded(costSheet.monthlyTotal)}</span> por mês.</h1>
        </div>
        <div class="hero-aside" data-reveal style="--delay: 120ms">
          <p class="lead">
            Vendas, estoque e medicamentos controlados rodando em serviços gerenciados da AWS.
            Siga uma requisição pelo diagrama, abra cada serviço e simule o tráfego com os custos reais da planilha.
          </p>
          <div class="hero-actions">
            <a class="button button--primary" href="#arquitetura">
              <span>Ver o diagrama</span>
              <span class="button-icon">${arrowDown}</span>
            </a>
            <a class="button button--ghost" href="${repoUrl}" target="_blank" rel="noreferrer">
              <span>GitHub</span>
              <span class="button-icon">${arrowUpRight}</span>
            </a>
          </div>
        </div>
      </div>
    </header>`
}

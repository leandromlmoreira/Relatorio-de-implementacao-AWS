import { costInsight, renderCostBreakdown } from './cost-breakdown'
import { renderDecisions } from './decisions'
import { renderDocs } from './docs'
import { renderFacts, renderHero } from './hero'
import { renderNav } from './nav'
import { repoUrl } from '../lib/links'

interface SectionHead {
  index: string
  eyebrow: string
  title: string
  text: string
}

function sectionHead({ index, eyebrow, title, text }: SectionHead, id: string): string {
  return `
    <div class="section-head" data-reveal>
      <p class="eyebrow"><span class="eyebrow-index">${index}</span>${eyebrow}</p>
      <h2 id="${id}">${title}</h2>
      <p class="section-text">${text}</p>
    </div>`
}

const legend = `
  <ul class="legend" aria-label="Legenda do diagrama">
    <li class="legend-title">Legenda</li>
    <li><span class="legend-dot legend-dot--request"></span>Requisição do cliente</li>
    <li><span class="legend-dot legend-dot--static"></span>Arquivo estático</li>
    <li><span class="legend-dot legend-dot--metric"></span>Métrica e log</li>
    <li><span class="legend-line"></span>Réplica Multi-AZ</li>
  </ul>`

function architectureSection(): string {
  return `
    <section class="section section--architecture" id="arquitetura" aria-labelledby="arquitetura-title">
      <div class="section-row" data-reveal>
        <div class="section-head section-head--compact">
          <p class="eyebrow"><span class="eyebrow-index">01</span>Caminho da requisição</p>
          <h2 id="arquitetura-title">Um pedido, do navegador ao banco.</h2>
          <p class="section-text">Cada ponto é uma requisição. Clique em um serviço para ver papel, custo e decisões.</p>
        </div>
      </div>
      <div class="shell" data-reveal style="--delay: 120ms">
        <div class="shell-core diagram-card">
          <div class="diagram-stage">
            ${legend}
            <div class="diagram-host" data-diagram></div>
          </div>
          <div class="sim-host" data-simulator></div>
        </div>
      </div>
      ${renderFacts()}
    </section>`
}

function costsSection(): string {
  return `
    <section class="section" id="custos" aria-labelledby="custos-title">
      ${sectionHead(
        {
          index: '02',
          eyebrow: 'Custos',
          title: 'Para onde vai cada dólar.',
          text: costInsight(),
        },
        'custos-title',
      )}
      <div class="shell" data-reveal><div class="shell-core">${renderCostBreakdown()}</div></div>
    </section>`
}

function comparisonSection(): string {
  return `
    <section class="section" id="comparacao" aria-labelledby="comparacao-title">
      ${sectionHead(
        {
          index: '03',
          eyebrow: 'AWS x on-premises',
          title: 'O servidor é barato. A equipe para mantê-lo, não.',
          text: 'Custo recorrente de um ano contra a mesma capacidade em estrutura própria. Desligue o salário do administrador de TI e veja de onde vem a economia.',
        },
        'comparacao-title',
      )}
      <div class="shell" data-reveal><div class="shell-core" data-comparison></div></div>
    </section>`
}

function decisionsSection(): string {
  return `
    <section class="section" id="decisoes" aria-labelledby="decisoes-title">
      ${sectionHead(
        {
          index: '04',
          eyebrow: 'Decisões de arquitetura',
          title: 'O que sustenta a operação.',
          text: 'Rede, segurança, continuidade e observabilidade, resumidas da documentação técnica e do manual de implementação.',
        },
        'decisoes-title',
      )}
      ${renderDecisions()}
    </section>`
}

function docsSection(): string {
  return `
    <section class="section section--docs" id="documentos" aria-labelledby="documentos-title">
      ${sectionHead(
        {
          index: '05',
          eyebrow: 'Documentos',
          title: 'Tudo aqui vem do repositório.',
          text: 'A página lê a planilha e a documentação técnica no build. Os arquivos originais estão no GitHub.',
        },
        'documentos-title',
      )}
      ${renderDocs()}
    </section>`
}

function footer(): string {
  return `
    <footer class="footer">
      <p>Arquitetura de referência para e-commerce farmacêutico · cenário fictício Abstergo Industries.</p>
      <p><a href="${repoUrl}" target="_blank" rel="noreferrer">leandromlmoreira/aws-pharma-architecture</a></p>
      <p class="footer-credit">Base: desafio de infraestrutura da trilha AWS da DIO.</p>
    </footer>`
}

export function renderPage(): string {
  return `
    <a class="skip-link" href="#arquitetura">Pular para o diagrama</a>
    ${renderNav()}
    ${renderHero()}
    <main>
      ${architectureSection()}
      ${costsSection()}
      ${comparisonSection()}
      ${decisionsSection()}
      ${docsSection()}
    </main>
    ${footer()}
    <div class="panel-root" data-panel></div>`
}

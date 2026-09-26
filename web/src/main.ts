import './style.css'
import { architectureDiagram } from './diagram'
import { components, custos, docs, economiaOnPremises, rawBase, repoUrl, totalAnual, totalMensal } from './data'

const app = document.querySelector<HTMLDivElement>('#app')!

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

app.innerHTML = `
  <header class="hero">
    <div class="hero-inner">
      <p class="eyebrow">Arquitetura de referência AWS</p>
      <h1>E-commerce farmacêutico na AWS</h1>
      <p class="lead">
        Infraestrutura de referência combinando computação, banco de dados
        gerenciado e observabilidade para suportar vendas online, controle
        de estoque e rastreabilidade de medicamentos controlados.
      </p>
      <a class="hero-link" href="${repoUrl}" target="_blank" rel="noreferrer">Ver repositório no GitHub</a>
    </div>
  </header>

  <main>
    <section class="diagram-section" aria-labelledby="diagram-title">
      <h2 id="diagram-title">Diagrama da arquitetura</h2>
      <p class="section-lead">
        Tráfego público entra por Route 53 e CloudFront, passa por um
        Application Load Balancer e é distribuído entre instâncias EC2 em
        Auto Scaling, que se conectam a um banco RDS MySQL Multi-AZ isolado
        em subnets privadas. CloudWatch monitora EC2 e RDS; S3 guarda backups.
      </p>
      <div class="diagram-frame">${architectureDiagram}</div>
    </section>

    <section class="components-section" aria-labelledby="components-title">
      <h2 id="components-title">Componentes</h2>
      <div class="cards">
        ${components.map(renderComponent).join('')}
      </div>
    </section>

    <section class="costs-section" aria-labelledby="costs-title">
      <h2 id="costs-title">Custos estimados</h2>
      <p class="section-lead">Valores de <code>analise-custos.csv</code>, no repositório.</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Configuração</th>
              <th>Custo mensal</th>
              <th>Custo anual</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            ${custos.map(renderCostRow).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2">Total</td>
              <td>${currency.format(totalMensal)}</td>
              <td>${currency.format(totalAnual)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="savings">
        <p>
          Comparado a manter a mesma capacidade on-premises
          (${currency.format(economiaOnPremises.totalAnual)}/ano, incluindo servidor,
          manutenção, energia e administrador de TI), a arquitetura na AWS
          representa uma economia estimada de
          <strong>${currency.format(economiaOnPremises.economiaAnual)} por ano
          (${economiaOnPremises.percentual}%)</strong>.
        </p>
      </div>
    </section>

    <section class="docs-section" aria-labelledby="docs-title">
      <h2 id="docs-title">Documentação</h2>
      <ul class="docs-list">
        ${docs.map(renderDoc).join('')}
      </ul>
    </section>
  </main>

  <footer class="site-footer">
    <p>Feito a partir do repositório <a href="${repoUrl}" target="_blank" rel="noreferrer">leandromlmoreira/Relatorio-de-implementacao-AWS</a>.</p>
  </footer>
`

function renderComponent(item: (typeof components)[number]): string {
  return `
    <article class="card accent-${item.accent}">
      <h3>${item.name}</h3>
      <p>${item.role}</p>
    </article>
  `
}

function renderCostRow(row: (typeof custos)[number]): string {
  return `
    <tr>
      <td>${row.servico}</td>
      <td>${row.configuracao}</td>
      <td>${currency.format(row.custoMensal)}</td>
      <td>${currency.format(row.custoAnual)}</td>
      <td class="muted">${row.observacoes}</td>
    </tr>
  `
}

function renderDoc(item: (typeof docs)[number]): string {
  return `
    <li>
      <a href="${rawBase}${item.file}" target="_blank" rel="noreferrer">${item.label}</a>
      <p>${item.description}</p>
    </li>
  `
}

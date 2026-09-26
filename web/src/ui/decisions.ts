import { docFacts } from '../data/doc-facts'
import { alertIcon } from '../lib/icons'

interface Threshold {
  label: string
  value: number
  display: string
}

const thresholds: Threshold[] = [
  { label: 'CPU', value: docFacts.cpuAlarm, display: `> ${docFacts.cpuAlarm}%` },
  { label: 'Memória', value: 85, display: '> 85%' },
  { label: 'Disco', value: 90, display: '> 90%' },
  { label: 'Conexões de banco', value: 80, display: '> 80%' },
]

const retention = [
  { label: 'CloudTrail', days: 90 },
  { label: 'VPC Flow Logs', days: 30 },
  { label: 'Logs de aplicação', days: 7 },
]

function networkCard(): string {
  return `
    <article class="bento-card bento-card--network" data-reveal>
      <p class="card-kicker">Rede</p>
      <h3>Duas camadas, uma saída controlada</h3>
      <p class="card-text">A VPC ${docFacts.vpcCidr} separa o que recebe tráfego da internet do que guarda dados. As subnets privadas saem pelo NAT Gateway e nunca recebem conexões de fora.</p>
      <div class="subnet-map">
        <div class="subnet subnet--public">
          <span class="subnet-kind">Públicas</span>
          <code>10.0.1.0/24</code><code>10.0.2.0/24</code>
          <span class="subnet-hosts">Load Balancer · NAT Gateway</span>
        </div>
        <div class="subnet subnet--private">
          <span class="subnet-kind">Privadas</span>
          <code>10.0.3.0/24</code><code>10.0.4.0/24</code>
          <span class="subnet-hosts">EC2 · RDS MySQL</span>
        </div>
      </div>
    </article>`
}

function securityCard(): string {
  return `
    <article class="bento-card bento-card--security" data-reveal style="--delay: 80ms">
      <p class="card-kicker">Segurança</p>
      <h3>Banco acessível só pela aplicação</h3>
      <ul class="rule-list">
        <li><code>3306</code><span>RDS aceita apenas o security group das EC2</span></li>
        <li><code>443</code><span>HTTPS com certificado do Certificate Manager</span></li>
        <li class="is-flagged"><code>22</code><span>SSH aberto para 0.0.0.0/0 na documentação</span><span class="flag-icon" aria-label="Ponto de revisão">${alertIcon}</span></li>
      </ul>
    </article>`
}

function continuityCard(): string {
  return `
    <article class="bento-card bento-card--continuity" data-reveal>
      <p class="card-kicker">Continuidade</p>
      <div class="continuity-figures">
        <div><span class="figure-value">${Number.parseInt(docFacts.rto, 10)} h</span><span class="figure-label">RTO</span></div>
        <div><span class="figure-value">${Number.parseInt(docFacts.rpo, 10)} h</span><span class="figure-label">RPO</span></div>
      </div>
      <p class="card-text">Backup automático do RDS às 03:00 UTC com 7 dias de retenção, snapshots semanais das EC2 e região de recuperação em ${docFacts.drRegion}.</p>
    </article>`
}

function observabilityCard(): string {
  const rows = thresholds
    .map(
      (item) => `
        <li>
          <span class="threshold-label">${item.label}</span>
          <span class="threshold-track" aria-hidden="true"><span style="transform: scaleX(${item.value / 100})"></span></span>
          <span class="threshold-value">${item.display}</span>
        </li>`,
    )
    .join('')
  return `
    <article class="bento-card bento-card--observability" data-reveal style="--delay: 80ms">
      <p class="card-kicker">Observabilidade</p>
      <h3>Alarmes antes da reclamação</h3>
      <ul class="threshold-list">${rows}</ul>
      <p class="card-foot">Tempo de resposta acima de 2 s também alerta, por e-mail e SMS.</p>
    </article>`
}

function auditCard(): string {
  const max = Math.max(...retention.map((item) => item.days))
  const rows = retention
    .map(
      (item) => `
        <li>
          <span class="threshold-label">${item.label}</span>
          <span class="threshold-track threshold-track--neutral" aria-hidden="true"><span style="transform: scaleX(${item.days / max})"></span></span>
          <span class="threshold-value">${item.days} dias</span>
        </li>`,
    )
    .join('')
  return `
    <article class="bento-card bento-card--audit" data-reveal style="--delay: 160ms">
      <p class="card-kicker">Auditoria</p>
      <h3>Retenção de logs</h3>
      <ul class="threshold-list">${rows}</ul>
      <p class="card-foot">Rotina diária de logs e métricas; semanal de patches e revisão de segurança.</p>
    </article>`
}

export function renderDecisions(): string {
  return `<div class="bento">${networkCard()}${securityCard()}${continuityCard()}${observabilityCard()}${auditCard()}</div>`
}

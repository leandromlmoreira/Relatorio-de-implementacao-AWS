import { arrowUpRight } from '../lib/icons'
import { fileUrl } from '../lib/links'

const documents = [
  {
    file: 'documentacao-tecnica.md',
    title: 'Documentação técnica',
    text: 'Especificações de EC2 e RDS, rede, security groups, backup, disaster recovery e alarmes.',
  },
  {
    file: 'manual-implementacao-aws.md',
    title: 'Manual de implementação',
    text: 'Passo a passo de EC2, RDS e CloudWatch, rotinas de manutenção e troubleshooting.',
  },
  {
    file: 'analise-custos.csv',
    title: 'Análise de custos',
    text: 'A planilha que alimenta esta página: custo mensal e anual por serviço e comparação com on-premises.',
  },
]

export function renderDocs(): string {
  const cards = documents
    .map(
      (doc, index) => `
        <li data-reveal style="--delay: ${index * 70}ms">
          <a class="doc-card" href="${fileUrl(doc.file)}" target="_blank" rel="noreferrer">
            <span class="doc-file">${doc.file}</span>
            <span class="doc-title">${doc.title}</span>
            <span class="doc-text">${doc.text}</span>
            <span class="doc-arrow" aria-hidden="true">${arrowUpRight}</span>
          </a>
        </li>`,
    )
    .join('')
  return `<ul class="doc-grid">${cards}</ul>`
}

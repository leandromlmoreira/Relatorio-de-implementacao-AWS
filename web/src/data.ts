export interface Component {
  name: string
  role: string
  accent: 'blue' | 'green' | 'yellow' | 'red'
}

export const components: Component[] = [
  {
    name: 'Amazon EC2',
    role: 'Hospeda a aplicação web (pedidos online, catálogo de produtos), com Auto Scaling entre 1 e 5 instâncias.',
    accent: 'blue',
  },
  {
    name: 'Amazon RDS (MySQL)',
    role: 'Banco de dados gerenciado para catálogo, clientes, vendas e controle de medicamentos controlados, com backup automático e alta disponibilidade.',
    accent: 'green',
  },
  {
    name: 'Amazon CloudWatch',
    role: 'Monitoramento de performance, dashboards e alertas automáticos de disponibilidade.',
    accent: 'yellow',
  },
  {
    name: 'Amazon VPC',
    role: 'Isolamento de rede com subnets públicas/privadas, NAT Gateway e security groups dedicados.',
    accent: 'blue',
  },
  {
    name: 'Amazon S3',
    role: 'Armazenamento de backups e arquivos estáticos.',
    accent: 'green',
  },
  {
    name: 'CloudFront + Route 53',
    role: 'CDN e DNS para a camada pública da aplicação.',
    accent: 'yellow',
  },
  {
    name: 'AWS Certificate Manager',
    role: 'Certificados SSL/TLS para tráfego HTTPS no load balancer.',
    accent: 'red',
  },
]

export interface CostRow {
  servico: string
  configuracao: string
  custoMensal: number
  custoAnual: number
  observacoes: string
}

export const custos: CostRow[] = [
  { servico: 'Amazon EC2', configuracao: 't3.medium - 1 instância', custoMensal: 30.0, custoAnual: 360.0, observacoes: 'Instância de produção' },
  { servico: 'Amazon EC2', configuracao: 't3.small - 1 instância (staging)', custoMensal: 15.0, custoAnual: 180.0, observacoes: 'Ambiente de desenvolvimento' },
  { servico: 'Amazon RDS', configuracao: 'db.t3.micro - MySQL', custoMensal: 15.0, custoAnual: 180.0, observacoes: 'Banco de dados principal' },
  { servico: 'Amazon RDS', configuracao: 'db.t3.micro - MySQL (backup)', custoMensal: 8.0, custoAnual: 96.0, observacoes: 'Instância de backup' },
  { servico: 'Amazon CloudWatch', configuracao: 'Métricas + Logs', custoMensal: 10.0, custoAnual: 120.0, observacoes: 'Monitoramento básico' },
  { servico: 'Amazon S3', configuracao: 'Standard Storage - 100GB', custoMensal: 2.3, custoAnual: 27.6, observacoes: 'Backup e arquivos estáticos' },
  { servico: 'Amazon Route 53', configuracao: 'Hosted Zone', custoMensal: 0.5, custoAnual: 6.0, observacoes: 'DNS management' },
  { servico: 'Amazon Certificate Manager', configuracao: 'SSL Certificate', custoMensal: 0.0, custoAnual: 0.0, observacoes: 'Gratuito para uso com ALB' },
  { servico: 'Application Load Balancer', configuracao: 'ALB', custoMensal: 16.2, custoAnual: 194.4, observacoes: 'Load balancer' },
  { servico: 'Amazon VPC', configuracao: 'NAT Gateway', custoMensal: 32.4, custoAnual: 388.8, observacoes: 'Conectividade para subnets privadas' },
  { servico: 'Amazon EBS', configuracao: '30GB gp3', custoMensal: 2.4, custoAnual: 28.8, observacoes: 'Storage adicional' },
  { servico: 'Amazon Data Transfer', configuracao: 'Outbound - 1TB', custoMensal: 90.0, custoAnual: 1080.0, observacoes: 'Transferência de dados' },
  { servico: 'Amazon CloudFront', configuracao: 'CDN - 1TB', custoMensal: 85.0, custoAnual: 1020.0, observacoes: 'Content delivery' },
  { servico: 'Amazon SES', configuracao: 'Email service', custoMensal: 1.0, custoAnual: 12.0, observacoes: 'Notificações por email' },
  { servico: 'Amazon SNS', configuracao: 'Simple Notification Service', custoMensal: 0.5, custoAnual: 6.0, observacoes: 'Alertas SMS' },
]

export const totalMensal = custos.reduce((soma, item) => soma + item.custoMensal, 0)
export const totalAnual = custos.reduce((soma, item) => soma + item.custoAnual, 0)

export const economiaOnPremises = {
  servidorFisico: 5000.0,
  manutencaoAnual: 2000.0,
  energiaRefrigeracao: 1200.0,
  administradorTI: 60000.0,
  totalAnual: 65200.0,
  economiaAnual: 61500.4,
  percentual: 94,
}

export interface DocLink {
  label: string
  file: string
  description: string
}

export const docs: DocLink[] = [
  {
    label: 'Documentação técnica',
    file: 'documentacao-tecnica.md',
    description: 'Especificações técnicas, segurança, backup e disaster recovery.',
  },
  {
    label: 'Manual de implementação',
    file: 'manual-implementacao-aws.md',
    description: 'Guia de implementação passo a passo na AWS.',
  },
  {
    label: 'Análise de custos (CSV)',
    file: 'analise-custos.csv',
    description: 'Planilha de custos mensal/anual e comparação com on-premises.',
  },
]

export const repoUrl = 'https://github.com/leandromlmoreira/Relatorio-de-implementacao-AWS'
export const rawBase = `${repoUrl}/blob/main/`

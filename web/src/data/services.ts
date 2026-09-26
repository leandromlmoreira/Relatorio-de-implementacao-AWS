export type ServiceId = 'route53' | 'cloudfront' | 'alb' | 'ec2' | 'rds' | 's3' | 'cloudwatch' | 'vpc'

export interface Decision {
  text: string
  source: string
}

export interface Service {
  id: ServiceId
  name: string
  kind: string
  role: string
  sheetServices: string[]
  decisions: Decision[]
  review?: string
}

const TECH = 'documentacao-tecnica.md'
const MANUAL = 'manual-implementacao-aws.md'
const SHEET = 'analise-custos.csv'
const README = 'README.md'

export const services: Service[] = [
  {
    id: 'route53',
    name: 'Route 53',
    kind: 'DNS',
    role: 'Resolve o domínio público da farmácia e encaminha o cliente para a borda da CDN, o primeiro salto de toda requisição.',
    sheetServices: ['Amazon Route 53'],
    decisions: [
      { text: 'Uma hosted zone gerenciada para o domínio da loja.', source: SHEET },
      { text: 'DNS e CDN formam a camada pública; nenhum servidor fica exposto diretamente ao cliente.', source: README },
    ],
  },
  {
    id: 'cloudfront',
    name: 'CloudFront',
    kind: 'CDN',
    role: 'Entrega catálogo, imagens e arquivos estáticos perto do cliente e repassa ao load balancer só o que precisa de processamento.',
    sheetServices: ['Amazon CloudFront', 'Amazon Data Transfer'],
    decisions: [
      { text: 'Orçamento de 1 TB/mês de entrega pela CDN e 1 TB de transferência de saída.', source: SHEET },
      { text: 'Arquivos estáticos têm origem no S3, aliviando as instâncias de aplicação.', source: README },
    ],
  },
  {
    id: 'alb',
    name: 'Load Balancer',
    kind: 'ALB · HTTPS',
    role: 'Termina o HTTPS nas subnets públicas e distribui cada requisição entre as instâncias EC2 saudáveis.',
    sheetServices: ['Amazon Application Load Balancer', 'Amazon Certificate Manager'],
    decisions: [
      { text: 'Health check em /health com timeout de 30 segundos.', source: TECH },
      { text: 'Certificado SSL/TLS do Certificate Manager, sem custo quando usado com o ALB.', source: SHEET },
      { text: 'Subnets públicas 10.0.1.0/24 e 10.0.2.0/24.', source: TECH },
    ],
  },
  {
    id: 'ec2',
    name: 'EC2 · Auto Scaling',
    kind: 'Aplicação',
    role: 'Roda a loja (Nginx + PHP-FPM): pedidos online, catálogo e estoque. O grupo cresce e encolhe conforme a carga.',
    sheetServices: ['Amazon EC2', 'Amazon EBS'],
    decisions: [
      { text: 't3.medium com 2 vCPUs, 4 GB de memória, rede até 5 Gbps e 30 GB gp3.', source: TECH },
      { text: 'Auto Scaling entre 1 e 5 instâncias, com alvo de CPU em 70%.', source: TECH },
      { text: 'Ubuntu Server 20.04 LTS e snapshots semanais.', source: MANUAL },
      { text: 'Uma t3.small separada para staging.', source: SHEET },
    ],
    review: 'O security group documentado libera SSH (22) para 0.0.0.0/0. Em produção, vale restringir a origem do acesso administrativo.',
  },
  {
    id: 'rds',
    name: 'RDS MySQL',
    kind: 'Banco gerenciado',
    role: 'Guarda catálogo, clientes, vendas e o controle de medicamentos controlados, isolado nas subnets privadas.',
    sheetServices: ['Amazon RDS'],
    decisions: [
      { text: 'MySQL 8.0.35 em db.t3.micro, 20 GB gp2, em subnets privadas.', source: TECH },
      { text: 'Criptografia habilitada e subnet group dedicado.', source: MANUAL },
      { text: 'Backup automático diário às 03:00 UTC, com 7 dias de retenção.', source: TECH },
      { text: 'Porta 3306 aceita conexões apenas do security group das EC2.', source: TECH },
      { text: 'Recuperação de desastre em us-west-2 com RTO de 4 horas e RPO de 1 hora.', source: TECH },
    ],
  },
  {
    id: 's3',
    name: 'S3',
    kind: 'Objetos',
    role: 'Armazena os arquivos estáticos servidos pela CDN e recebe os backups da aplicação.',
    sheetServices: ['Amazon S3'],
    decisions: [
      { text: '100 GB em Standard Storage para estáticos e backups.', source: SHEET },
      { text: 'Dados da aplicação com backup incremental diário.', source: TECH },
    ],
  },
  {
    id: 'cloudwatch',
    name: 'CloudWatch',
    kind: 'Observabilidade',
    role: 'Recebe métricas e logs das instâncias e do banco e dispara alertas antes que o cliente perceba o problema.',
    sheetServices: ['Amazon CloudWatch', 'Amazon SES', 'Amazon SNS'],
    decisions: [
      { text: 'Métricas críticas: CPU > 80%, memória > 85%, disco > 90%, conexões de banco > 80% e resposta > 2 s.', source: TECH },
      { text: 'CPU acima de 80% por 5 minutos ou memória acima de 85% por 3 minutos disparam alerta.', source: MANUAL },
      { text: 'Alertas por e-mail (SES) e SMS (SNS).', source: SHEET },
      { text: 'CloudTrail retido por 90 dias, VPC Flow Logs por 30 e logs de aplicação por 7.', source: TECH },
    ],
  },
  {
    id: 'vpc',
    name: 'VPC',
    kind: 'Rede',
    role: 'Isola a aplicação em uma rede própria, com subnets públicas para a entrada e privadas para aplicação e banco.',
    sheetServices: ['Amazon VPC'],
    decisions: [
      { text: 'Bloco 10.0.0.0/16 com Internet Gateway habilitado.', source: TECH },
      { text: 'Subnets privadas 10.0.3.0/24 e 10.0.4.0/24, com saída pelo NAT Gateway.', source: TECH },
      { text: 'VPC Flow Logs habilitado para auditoria.', source: TECH },
    ],
  },
]

export function serviceById(id: ServiceId): Service {
  const service = services.find((item) => item.id === id)
  if (!service) throw new Error(`Serviço desconhecido: ${id}`)
  return service
}

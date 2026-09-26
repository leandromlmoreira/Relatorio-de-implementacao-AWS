# Documentação Técnica — Abstergo Industries

## Arquitetura da Solução

### Diagrama de Arquitetura
```
[Internet] → [Application Load Balancer] → [EC2 Instances] → [RDS MySQL]
                                      ↓
                              [CloudWatch Monitoring]
```

## Especificações Técnicas

### Amazon EC2
- **Tipo de Instância:** t3.medium
- **vCPUs:** 2
- **Memória:** 4 GB
- **Rede:** Até 5 Gbps
- **Storage:** 30 GB gp3 SSD

### Amazon RDS
- **Engine:** MySQL 8.0.35
- **Instance Class:** db.t3.micro
- **vCPUs:** 2
- **Memória:** 1 GB
- **Storage:** 20 GB gp2
- **Backup:** 7 dias de retenção

### Amazon CloudWatch
- **Métricas:** CPU, Memória, Disco, Rede
- **Logs:** Application logs, System logs
- **Alertas:** Email e SMS
- **Dashboards:** Customizados

## Configurações de Segurança

### Network Security
- **VPC:** 10.0.0.0/16
- **Subnets Públicas:** 10.0.1.0/24, 10.0.2.0/24
- **Subnets Privadas:** 10.0.3.0/24, 10.0.4.0/24
- **Internet Gateway:** Habilitado
- **NAT Gateway:** Para subnets privadas

### Security Groups
```
EC2 Security Group:
- SSH (22): 0.0.0.0/0
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0

RDS Security Group:
- MySQL (3306): EC2 Security Group
```

## Configurações de Backup

### Estratégia de Backup
- **RDS:** Backup automático diário às 03:00 UTC
- **EC2:** Snapshots semanais
- **Application Data:** Backup incremental diário

### Disaster Recovery
- **RTO:** 4 horas
- **RPO:** 1 hora
- **Região de DR:** us-west-2

## Monitoramento e Alertas

### Métricas Críticas
1. **CPU Utilization** > 80%
2. **Memory Usage** > 85%
3. **Disk Space** > 90%
4. **Database Connections** > 80%
5. **Response Time** > 2 segundos

### Canais de Notificação
- **Email:** admin@abstergo.com
- **SMS:** +55 11 99999-9999
- **Slack:** #aws-alerts

## Performance e Escalabilidade

### Auto Scaling
- **Mínimo:** 1 instância
- **Máximo:** 5 instâncias
- **Target:** CPU 70%

### Load Balancing
- **Tipo:** Application Load Balancer
- **Health Check:** /health
- **Timeout:** 30 segundos

## Custos Estimados (Mensal)

| Serviço | Configuração | Custo Estimado |
|---------|--------------|----------------|
| EC2 | t3.medium | $30.00 |
| RDS | db.t3.micro | $15.00 |
| CloudWatch | Métricas + Logs | $10.00 |
| **Total** | | **$55.00** |

## Compliance e Auditoria

### Logs de Auditoria
- **CloudTrail:** Habilitado para todas as APIs
- **VPC Flow Logs:** Habilitado
- **RDS Logs:** Habilitado

### Retenção de Logs
- **CloudTrail:** 90 dias
- **VPC Flow Logs:** 30 dias
- **Application Logs:** 7 dias


# MANUAL DE IMPLEMENTAÇÃO AWS - ABSTERGO INDUSTRIES

## Índice
1. [Introdução](#introdução)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração do Amazon EC2](#configuração-do-amazon-ec2)
4. [Configuração do Amazon RDS](#configuração-do-amazon-rds)
5. [Configuração do Amazon CloudWatch](#configuração-do-amazon-cloudwatch)
6. [Monitoramento e Manutenção](#monitoramento-e-manutenção)
7. [Troubleshooting](#troubleshooting)

## Introdução

Este manual fornece instruções detalhadas para implementar a infraestrutura AWS da Abstergo Industries, focando na plataforma virtual da farmácia.

## Pré-requisitos

- Conta AWS ativa
- Acesso de administrador
- Conhecimento básico em Linux
- Certificados SSL para HTTPS

## Configuração do Amazon EC2

### 1. Criação da Instância
```bash
# Tipo de instância recomendado: t3.medium
# Sistema operacional: Ubuntu Server 20.04 LTS
# Storage: 30 GB gp3
```

### 2. Configuração de Segurança
- Security Group: Portas 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Key Pair: Criar novo par de chaves
- VPC: Usar VPC padrão

### 3. Instalação de Dependências
```bash
sudo apt update
sudo apt install nginx mysql-client php-fpm php-mysql
```

## Configuração do Amazon RDS

### 1. Criação do Banco de Dados
- Engine: MySQL 8.0
- Instance Class: db.t3.micro
- Storage: 20 GB gp2
- Backup: Habilitado (7 dias)

### 2. Configuração de Segurança
- VPC Security Group: Porta 3306
- Subnet Group: Criar grupo de subnets privadas
- Encryption: Habilitado

## Configuração do Amazon CloudWatch

### 1. Métricas Personalizadas
- CPU Utilization
- Memory Usage
- Disk Space
- Database Connections

### 2. Alertas Configurados
- CPU > 80% por 5 minutos
- Memory > 85% por 3 minutos
- Disk Space > 90%

## Monitoramento e Manutenção

### Rotinas Diárias
- Verificar logs de aplicação
- Monitorar métricas de performance
- Backup automático do banco de dados

### Rotinas Semanais
- Análise de relatórios de uso
- Verificação de segurança
- Atualização de patches

## Troubleshooting

### Problemas Comuns
1. **Instância EC2 não responde**
   - Verificar Security Groups
   - Reiniciar instância via console

2. **Conexão com RDS falha**
   - Verificar VPC Security Groups
   - Confirmar credenciais

3. **Alertas CloudWatch**
   - Verificar logs detalhados
   - Escalar recursos se necessário

---

**Documento preparado por:** Leandro Macedo  
**Data:** 02/09/2025  
**Versão:** 1.0

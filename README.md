# BarberGo

O BarberGo é um sistema de gestão para barbearias baseado em SaaS (Software as a Service), com foco na automação de agendamentos, no relacionamento com clientes e no controle operacional do negócio.

A proposta da plataforma é centralizar processos do dia a dia da barbearia em uma aplicação web, reduzindo tarefas manuais, melhorando a organização interna e fortalecendo a recorrência de atendimentos.

## Visão Geral

O sistema foi pensado para atender barbearias que precisam organizar sua operação em um único ambiente digital, oferecendo:

- agendamento online para clientes;
- painel administrativo para gestão do negócio;
- controle financeiro e de estoque;
- cadastro e relacionamento com clientes;
- automação de comunicação via WhatsApp.

## Módulos do Sistema

### 1. Módulo de Agendamento

Responsável por permitir que clientes realizem agendamentos online por meio de um link público.

Principais funcionalidades:

- seleção de data e horário;
- identificação do cliente no momento do agendamento;
- registro automático dos agendamentos no sistema;
- visualização dos horários em um painel administrativo para o barbeiro.

### 2. Módulo Administrativo (Dashboard)

Interface exclusiva da barbearia para acompanhamento e controle das operações.

#### Gestão de Agenda

- visualização e controle dos agendamentos;
- organização por dia, semana ou mês.

#### Controle Financeiro

- registro manual de faturamento diário;
- geração de relatórios semanais e mensais;
- controle de despesas operacionais.

#### Controle de Estoque

- cadastro de produtos, como shampoo, pomadas e outros itens;
- monitoramento de entradas e saídas;
- alertas para reposição de estoque.

### 3. Módulo de Relacionamento (CRM)

Voltado ao armazenamento e acompanhamento básico das informações dos clientes.

Principais funcionalidades:

- cadastro de dados dos clientes, como nome e contato;
- histórico básico de interação e agendamento;
- segmentação simples de clientes.

### 4. Automação de Comunicação

Integração com o WhatsApp para melhorar o relacionamento com os clientes e reduzir faltas.

Principais funcionalidades:

- envio de confirmação de agendamento;
- lembretes automáticos;
- mensagens de reengajamento para clientes inativos há determinado período.

## Objetivo do Sistema

Centralizar e automatizar os processos operacionais da barbearia, promovendo:

- organização da agenda;
- melhoria na comunicação com clientes;
- controle financeiro e de estoque;
- aumento da retenção e da recorrência de atendimentos.

## Modelo de Negócio

O BarberGo segue o modelo SaaS com cobrança recorrente por assinatura mensal.

Possibilidades do modelo:

- mensalidade base considerada de `R$ 49,90`;
- planos escaláveis conforme o conjunto de funcionalidades oferecidas;
- crescimento da plataforma com possibilidade de expansão por níveis de serviço.

## Estrutura Atual do Projeto

Com base na estrutura atual do repositório, o sistema está organizado em módulos separados:

- `AgendamentoPublico/` - interface pública de agendamento;
- `agenda/` - gestão interna da agenda;
- `dashboard/` - painel administrativo;
- `clientes/` - gerenciamento de clientes;
- `financeiro/` - controle financeiro;
- `estoque/` - controle de estoque;
- `configuracoes/` - configurações do sistema;
- `login/` - autenticação e cadastro.

## Público-Alvo

Barbearias que desejam profissionalizar a operação, automatizar o atendimento e concentrar a gestão do negócio em uma única plataforma web.

## Proposta de Valor

O BarberGo busca oferecer uma solução simples e eficiente para que a barbearia consiga:

- atender melhor seus clientes;
- reduzir falhas operacionais;
- acompanhar indicadores do negócio;
- aumentar a produtividade e a fidelização.

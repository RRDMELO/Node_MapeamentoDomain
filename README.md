<h1 align="center">📦 Mapeando o domínio</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v24.17-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vitest-v5.0-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/testes-9%20passed-brightgreen?style=for-the-badge&logo=checkmarx&logoColor=white" alt="Tests" />
  <img src="https://img.shields.io/badge/arquitetura-DDD-blueviolet?style=for-the-badge" alt="DDD" />
  <img src="https://img.shields.io/badge/licença-ISC-blue?style=for-the-badge" alt="License" />
</p>

<p align="center">
  Aplicação Node.js desenvolvida a partir do mapeamento de domínio de um sistema real de gerenciamento de estoque.<br/>
  Implementa os princípios de <strong>Domain-Driven Design (DDD)</strong> com entidades, casos de uso e repositórios bem definidos.
</p>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Mapeamento de Domínio](#-mapeamento-de-domínio)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Executar](#-como-executar)
- [Como Testar](#-como-testar)
- [Testes Implementados](#-testes-implementados)

---

## 🧠 Sobre o Projeto

Este projeto foi criado a partir de uma **entrevista de mapeamento de domínio** entre um desenvolvedor e um Domain Expert de uma empresa de varejo. O objetivo foi identificar as entidades e casos de uso necessários para construir um sistema de gerenciamento de estoque robusto.

---

## 🗺️ Mapeamento de Domínio

### Entidades identificadas

| Entidade | Responsabilidade |
|---|---|
| `Product` | Produto individual com ID único, atributos extras (tamanho, cor), preço e quantidade mínima de estoque |
| `StockMovement` | Registro de cada movimentação de estoque (entrada, saída ou ajuste) |
| `Sale` | Venda realizada, com itens, receita total e lucro calculado automaticamente |
| `PurchaseOrder` | Ordem de compra para fornecedor, com status e prazo de entrega |
| `Supplier` | Fornecedor vinculado aos produtos, com e-mail e prazo padrão de entrega |
| `Notification` | Alerta de estoque baixo enviado por e-mail ou sistema interno |

### Casos de uso identificados

| Caso de Uso | Origem no diálogo com Domain Expert |
|---|---|
| Cadastrar produto | *"atribuir um número de identificação único... tamanho e cor"* |
| Definir estoque mínimo | *"definir um limite mínimo para cada produto"* |
| Atualizar estoque | *"rastrear facilmente suas movimentações"* |
| Alertar estoque baixo | *"receber alertas por e-mail e notificação no sistema"* |
| Registrar venda | *"quantos produtos vendemos... qual foi o lucro gerado"* |
| Visualizar relatório de vendas | *"produtos vendendo melhor em cada período"* |
| Visualizar histórico de estoque | *"tendências de estoque ao longo do tempo"* |
| Criar ordem de compra | *"criar e gerenciar ordens de compra"* |
| Gerar ordens automáticas | *"automaticamente, com base nas quantidades mínimas e nas tendências de vendas"* |
| Atualizar prazo de entrega | *"receber atualizações automáticas sobre os prazos de entrega"* |

---

## ✨ Funcionalidades

### 🏷️ Rastreamento Individual de Produto
Cada produto recebe um **UUID único** gerado automaticamente. É possível adicionar atributos extras como `tamanho` e `cor` para tornar o rastreamento mais preciso.

### 📉 Definição de Estoque Mínimo
Cada produto tem um limite mínimo configurável. A regra de domínio `isLowStock()` encapsula a lógica de verificação.

### 🔔 Alertas Automáticos de Estoque Baixo
Quando o estoque de um produto atinge ou cai abaixo do mínimo definido, o sistema dispara automaticamente alertas por dois canais:
- 📧 **E-mail** (via `INotificationService`, substituível por nodemailer/SendGrid)
- 🖥️ **Sistema interno** (notificação registrada no banco/memória)

### 📈 Histórico de Vendas e Estoque
Toda movimentação (entrada, saída, ajuste) é registrada como um `StockMovement`. As vendas são registradas como `Sale` com seus itens e lucro por item.

### 📊 Relatório de Desempenho por Produto
O relatório de vendas exibe, por produto e período:
- Quantidade total vendida
- Receita total gerada
- Lucro total
- Ordenado do produto mais vendido ao menos vendido

### 🛒 Ordens de Compra Manuais e Automáticas
- **Manual**: crie uma ordem para qualquer fornecedor com os itens e custos desejados.
- **Automática**: o sistema detecta todos os produtos com estoque baixo, agrupa por fornecedor e cria ordens de compra automaticamente com a quantidade necessária para reabastecer.

### 🔗 Integração com Fornecedores
O prazo de entrega de uma ordem de compra pode ser atualizado pelo fornecedor via `UpdateDeliveryForecast`, simulando uma integração com sistemas externos.

---

## 🏗️ Arquitetura

O projeto segue os princípios de **Domain-Driven Design (DDD)** com separação em camadas:

```
┌─────────────────────────────────────────────┐
│                  Use Cases                  │  ← Orquestra as regras de negócio
├─────────────────────────────────────────────┤
│              Domain (Entidades)             │  ← Regras puras, sem dependências externas
│          Domain (Repositórios/Ports)        │  ← Contratos/interfaces
├─────────────────────────────────────────────┤
│      Infra (Repositórios In-Memory)         │  ← Implementações concretas (substituíveis)
│      Services (NotificationService)         │  ← Adaptadores externos
└─────────────────────────────────────────────┘
```

> **Princípio de Inversão de Dependência (DIP)**: os casos de uso dependem apenas de interfaces definidas no domínio. As implementações concretas (banco de dados, e-mail, etc.) são injetadas via construtor.

---

## 📁 Estrutura de Pastas

```
src/
├── domain/
│   ├── entities/
│   │   ├── Product.ts            # Entidade produto
│   │   ├── StockMovement.ts      # Entidade movimentação de estoque
│   │   ├── Sale.ts               # Entidade venda
│   │   ├── PurchaseOrder.ts      # Entidade ordem de compra
│   │   ├── Supplier.ts           # Entidade fornecedor
│   │   └── Notification.ts       # Entidade notificação de alerta
│   └── repositories/
│       ├── IProductRepository.ts
│       ├── IStockMovementRepository.ts
│       ├── ISaleRepository.ts
│       ├── IPurchaseOrderRepository.ts
│       ├── ISupplierRepository.ts
│       └── INotificationRepository.ts
├── usecases/
│   ├── RegisterProduct.ts              # Cadastrar produto
│   ├── SetMinimumStock.ts              # Definir estoque mínimo
│   ├── UpdateStock.ts                  # Atualizar estoque + alertas
│   ├── RecordSale.ts                   # Registrar venda
│   ├── GetSalesReport.ts               # Relatório de vendas
│   ├── GetStockHistory.ts              # Histórico de estoque
│   ├── CreatePurchaseOrder.ts          # Criar ordem de compra
│   ├── AutoGeneratePurchaseOrders.ts   # Gerar ordens automaticamente
│   └── UpdateDeliveryForecast.ts       # Atualizar prazo de entrega
├── services/
│   └── INotificationService.ts         # Interface do serviço de notificação
├── infra/
│   └── repositories/
│       ├── InMemoryProductRepository.ts
│       ├── InMemoryStockMovementRepository.ts
│       ├── InMemorySaleRepository.ts
│       ├── InMemoryPurchaseOrderRepository.ts
│       ├── InMemorySupplierRepository.ts
│       ├── InMemoryNotificationRepository.ts
│       └── ConsoleNotificationService.ts   # Notificação via console (dev)
└── __tests__/
    └── usecases.test.ts                # Suite completa de testes
```

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- npm v9+

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Instale as dependências
npm install
```

### Executar a demonstração

```bash
npm run dev
```

O comando compila o TypeScript e executa o arquivo `src/index.ts`, que simula o fluxo completo:
1. Cadastro de fornecedor e produtos
2. Registro de vendas
3. Exibição do relatório de vendas
4. Verificação de estoque baixo (com alerta automático)
5. Geração de ordem de compra automática
6. Atualização de prazo de entrega pelo fornecedor

**Saída esperada:**

```
=== Sistema de Gerenciamento de Estoque ===

✅ Fornecedor cadastrado: TechSupply Ltda
✅ Produto cadastrado: Teclado Mecânico (ID: ...)
✅ Produto cadastrado: Mouse Gamer (ID: ...)

📦 Registrando vendas...
[EMAIL] 📦 Teclado Mecânico: Alerta: O estoque do produto "Teclado Mecânico" está baixo (3 unidades). Mínimo definido: 5.
[SYSTEM] 📦 Teclado Mecânico: Alerta: O estoque do produto "Teclado Mecânico" está baixo (3 unidades). Mínimo definido: 5.

📊 Relatório de Vendas:
  Teclado Mecânico: 17 unidades | Receita: R$5950.00 | Lucro: R$3910.00
  Mouse Gamer: 8 unidades | Receita: R$1440.00 | Lucro: R$960.00

📋 Histórico de movimentação do Teclado: 2 registros

⚠️  Estoque atual do Teclado: 3 (mínimo: 5)
   isLowStock: true

🛒 Gerando ordens de compra automáticas...
  Ordem criada para fornecedor ...: 1 item(s) | Total: R$840.00
  → Prazo de entrega atualizado: 04/10/2026

✨ Demo concluída!
```

### Build para produção

```bash
npm run build
# Gera os arquivos compilados em dist/
```

---

## 🧪 Como Testar

```bash
npm test
```

O comando executa todos os testes com **Vitest**. Os testes rodam diretamente sobre os arquivos TypeScript sem necessidade de compilação prévia.

**Saída esperada:**

```
 RUN  v5.0.1

 ✓ src/__tests__/usecases.test.ts (9 tests) ~12ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Duration  ~400ms
```

---

## 🔬 Testes Implementados

Todos os testes estão em [`src/__tests__/usecases.test.ts`](src/__tests__/usecases.test.ts) e utilizam repositórios **in-memory** para isolar completamente o domínio de qualquer infraestrutura externa.

### ✅ `RegisterProduct` — Cadastrar Produto

**Verifica:** que um produto é criado corretamente com ID único, atributos extras (`size`, `color`), quantidade inicial e que `isLowStock()` retorna `false` quando o estoque está acima do mínimo.

```
✓ deve cadastrar um produto com atributos extras
```

---

### ✅ `UpdateStock & alertas` — Atualizar Estoque

**Verifica (2 testes):**

1. Que ao retirar itens e o estoque atingir o mínimo, **2 notificações são disparadas** (EMAIL + SYSTEM) com a mensagem correta.
2. Que uma saída maior que o estoque disponível **lança um erro** `'Insufficient stock'`.

```
✓ deve reduzir o estoque e disparar alerta quando abaixo do mínimo
✓ deve lançar erro se quantidade insuficiente
```

---

### ✅ `SetMinimumStock` — Definir Estoque Mínimo

**Verifica:** que o estoque mínimo de um produto existente é atualizado corretamente.

```
✓ deve atualizar o estoque mínimo de um produto
```

---

### ✅ `RecordSale & relatório` — Registrar Venda e Relatório

**Verifica:** que uma venda com múltiplos itens é registrada e que o relatório retorna a quantidade vendida, receita e **lucro calculados corretamente** por produto.

```
✓ deve registrar venda e calcular lucro corretamente
```

---

### ✅ `GetStockHistory` — Histórico de Movimentações

**Verifica:** que as movimentações de estoque (entrada e saída) são registradas e retornadas em ordem, filtradas por produto.

```
✓ deve retornar histórico de movimentações por produto
```

---

### ✅ `CreatePurchaseOrder` — Criar Ordem de Compra

**Verifica:** que uma ordem de compra é criada com status `PENDING`, custo total calculado corretamente e nome do produto resolvido.

```
✓ deve criar uma ordem de compra manualmente
```

---

### ✅ `AutoGeneratePurchaseOrders` — Geração Automática de Ordens

**Verifica:** que o sistema detecta produtos com estoque baixo (vinculados a um fornecedor) e **gera automaticamente** uma ordem de compra agrupada por fornecedor.

```
✓ deve gerar ordens automáticas para produtos com estoque baixo
```

---

### ✅ `UpdateDeliveryForecast` — Atualizar Prazo de Entrega

**Verifica:** que o prazo de entrega estimado de uma ordem de compra é atualizado corretamente, simulando a integração com um fornecedor externo.

```
✓ deve atualizar o prazo de entrega da ordem
```

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| [Node.js](https://nodejs.org/) | v24.17 | Runtime |
| [TypeScript](https://www.typescriptlang.org/) | v5.x | Tipagem estática |
| [Vitest](https://vitest.dev/) | v5.0 | Testes unitários |

---

## 📄 Licença

Distribuído sob a licença **ISC**. Veja `package.json` para mais detalhes.


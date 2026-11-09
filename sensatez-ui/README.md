# 🏛️ Sensatez UI — Frontend Angular MVP (Clean Architecture + CQRS)

Frontend oficial do sistema **Sensatez Administração Imobiliária**, desenvolvido em **Angular 18+ (Standalone Components + Signals)** com **Clean Architecture** e **Padrão CQRS**, integrado à API `.NET 10` (`http://localhost:5114/api`).

---

## 🏗️ Estrutura da Arquitetura Limpa + CQRS

- **`src/app/domain/`**: Camada de domínio pura (zero dependências HTTP). Contém os 6 Enums de domínio com metadados visuais em PT-BR, modelos/interfaces dos 7 módulos, `DocumentValidator` (CPF/CNPJ Módulo 11) e os contratos abstratos de Repositório (`Ports`).
- **`src/app/application/`**: Camada de aplicação e CQRS. Contém `CommandBus`, `QueryBus`, todos os `Commands`, `Queries`, `CommandHandlers`, `QueryHandlers` e os `Signal Stores` reativos (`AuthStore`, `FinancialHubStore`, `PropertiesStore`, `ContractsStore`, `OwnersStore`, `TenantsStore`).
- **`src/app/infrastructure/`**: Camada de infraestrutura. Contém `Http*Repository` (`Adapters`), `jwtInterceptor`, `problemDetailsInterceptor` (tratamento global RFC 7807 `application/problem+json`), `TokenStorageService` e `ThemeService` (Dark Mode & Light Mode).
- **`src/app/presentation/`**: Camada de apresentação e Design System reutilizável extraído dos 3 prints de referência (`KpiMetricCard`, `StatusSummaryStrip`, `UnderlineTabs`, `PillTabs`, `StatusBadge`, `ChargeAgendaCard`, `PixCopyButton`, `WhatsappButton`, `ToastContainer`) e páginas.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
1. Certifique-se de que o **Node.js (v20 LTS ou v22 LTS)** está instalado (`winget install OpenJS.NodeJS.LTS`).
2. Certifique-se de que a **API .NET 10** está rodando em `http://localhost:5114`:
   ```bash
   dotnet run --project ../src/Sensatez.Api/Sensatez.Api.csproj
   ```

### Instalar Dependências e Rodar o Frontend
```bash
cd sensatez-ui
npm install
npm start
```

Acesse no navegador: 👉 **`http://localhost:4200`**
- **E-mail padrão (Seed):** `admin@sensatez.com.br`
- **Senha padrão (Seed):** `Admin@2026!`


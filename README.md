# Zelo — Aplicativo Mobile (React Native + Expo)

**Global Solution 2026/2 — FIAP**  
**Tema:** CitizenTech  
**Disciplina:** Mobile Application Development  
**Professor:** Felipe Cavalcante Vilella de Oliveira  

## Integrantes do Grupo (2TDSPV)

| Nome | RM |
| :--- | :--- |
| Leandro Guarido de Oliveira | 561760 |
| Gabriel Costa Solano | 562325 |
| Kaiky Pereira Rodrigues Da Silva | 564578 |

---

## 📺 Demonstração em Vídeo

- **Link no YouTube (até 5 min):** [https://youtu.be/8Bvqe0Pwj5E](https://youtu.be/8Bvqe0Pwj5E)
- **Duração Oficial:** 4m 48s (em conformidade com o limite máximo de 5:00 da disciplina)
- **Tópicos Demonstrados:**
  1. **Arquitetura no VS Code:** Estrutura de pastas `src/` em camadas, camada HTTP nativa (`fetchWithTimeout`), injeção dinâmica do commit hash do Git no `app.config.js`.
  2. **Autenticação:** Telas de login e cadastro, validações de formulário e persistência de sessão.
  3. **CRUD Completo de Medicamentos:** Listagem, cadastro de novo lembrete, edição de horário e exclusão com feedback visual (integrado à API REST).
  4. **Perfil Cuidador:** Monitoramento da residência em tempo real, fluxo de atendimento de alerta (*"Vou verificar agora"*), registro de desfecho com retorno ao status Normal, gestão da rede de apoio e resumo semanal.
  5. **Perfil Idoso e Acessibilidade:** Interface simplificada, confirmação de remédios de hoje, check-in com respostas rápidas, botão de emergência com modal de segurança contra toque acidental e tela "Sobre o Aplicativo".

---

## Visão Geral do Projeto

O **Zelo** é uma plataforma de monitoramento de rotina não invasivo para idosos que moram sozinhos, baseada em sensores de presença e de abertura de porta (sem uso de câmeras). Quando é identificado um desvio na rotina diária, o sistema realiza primeiro um **check-in** com o idoso. Caso não haja resposta ou o idoso solicite auxílio, o alerta é escalado para a **rede de apoio** (familiares e vizinhos cadastrados) até que um responsável assuma a verificação.

O aplicativo `zelo-app` atende aos diferentes perfis do sistema:
1. **Perfil Idoso (Dona Maria):** Interface limpa, espaçada e acessível, com confirmação de medicamentos do dia, check-in rápido de bem-estar e botão de emergência com confirmação em duas etapas contra toque acidental.
2. **Perfil Cuidador / Familiar / Guardião (Ana e José):** Acompanhamento em tempo real do status da residência, atendimento de alertas (confirmação de verificação e registro de desfecho), gerenciamento completo de lembretes de medicamentos, rede de apoio ordenada por prioridade e resumo semanal da rotina.

---

## Telas e Rotas do Aplicativo

| Rota | Tela | Perfil | Funcionalidades |
|---|---|---|---|
| `/sign-in` | **Login** | Público | Autenticação por e-mail e senha, acesso rápido aos perfis cadastrados e link para informações do app. |
| `/sign-up` | **Criar Conta** | Público | Cadastro de novos usuários com definição de vínculo (`FAMILIAR`, `GUARDIAO`, `IDOSO`). |
| `/idoso` | **Início do Idoso** | Idoso | Tela simplificada com card de check-in, confirmação de remédios do dia e botão de emergência com modal de confirmação. |
| `/idoso/checkin` | **Check-in** | Idoso | Respostas rápidas de um toque (*"Estou bem"*, *"Acordei mais tarde"*, *"Preciso de ajuda"*) ou envio de mensagem livre. |
| `/cuidador` | **Painel** | Cuidador | Status atualizado da residência, alerta em aberto (quando houver) e acesso aos módulos de gerenciamento. |
| `/cuidador/alerta/[id]` | **Detalhes do Alerta** | Cuidador | Confirmação de atendimento (*"Vou verificar agora"*) e encerramento com registro de desfecho e observações. |
| `/cuidador/lembretes` | **Lembretes de Remédios** | Cuidador | Listagem dos medicamentos ativos, horários, dias programados e exclusão com confirmação. |
| `/cuidador/lembretes/form` | **Novo / Editar Lembrete** | Cuidador | Cadastro e atualização de medicamentos com validação de horário (`HH:mm`), seleção de dias da semana e status. |
| `/cuidador/rede-apoio` | **Rede de Apoio** | Cuidador | Contatos de emergência ordenados por prioridade de acionamento e cadastro de novos contatos. |
| `/cuidador/resumo` | **Resumo Semanal** | Cuidador | Visão geral da semana, indicadores de rotina e registros de dias fora do padrão. |
| `/sobre` | **Sobre o Aplicativo** | Sistema | Informações de versão, identificador de pacote (`br.fiap.mad.zelo.rm561760`), hash do commit Git e status das APIs. |

---

## Arquitetura Técnica

1. **Consumo de APIs com `fetch` e TanStack Query:**
   - Comunicação HTTP utilizando `fetch` nativo e gerenciamento de cache/estado assíncrono com `@tanstack/react-query`.
2. **Camada de Serviços (`src/services/*.ts`):**
   - Funções de transporte HTTP isoladas por domínio (`authService`, `monitorService`, `lembretesService`, `redeApoioService`, `insightsService`).
3. **Custom Hooks (`src/hooks/use*Query.ts` e `use*Mutation.ts`):**
   - Hooks dedicados para leitura e escrita (`useQuery` e `useMutation`), com atualização automática de cache (`invalidateQueries`) após operações de criação, edição, exclusão e confirmação.
4. **Autenticação e Sessão (`src/providers/AuthProvider.tsx`):**
   - Contexto de autenticação com persistência local via `@react-native-async-storage/async-storage` e proteção de rotas no Expo Router.
5. **Identificação de Versão e Build (`src/app/sobre.tsx` e `app.config.js`):**
   - Leitura de metadados nativos com `expo-application` e injeção dinâmica do hash do commit (`git rev-parse --short HEAD`) via `app.config.js`.
   - Perfil de distribuição Android configurado em `eas.json` (`br.fiap.mad.zelo.rm561760`).

---

## Estrutura de Pastas

```text
zelo-app/
├── assets/
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   ├── sobre.tsx
│   │   ├── cuidador/
│   │   │   ├── index.tsx
│   │   │   ├── alerta/[id].tsx
│   │   │   ├── lembretes/
│   │   │   │   ├── index.tsx
│   │   │   │   └── form.tsx
│   │   │   ├── rede-apoio.tsx
│   │   │   └── resumo.tsx
│   │   └── idoso/
│   │       ├── index.tsx
│   │       └── checkin.tsx
│   ├── components/
│   │   ├── ErrorState.tsx
│   │   ├── HeaderZelo.tsx
│   │   ├── LoadingState.tsx
│   │   └── StatusBadge.tsx
│   ├── hooks/
│   ├── providers/
│   │   └── AuthProvider.tsx
│   ├── services/
│   ├── theme/
│   │   └── colors.ts
│   └── types/
│       └── zelo.ts
├── .env.example
├── app.config.js
├── eas.json
├── package.json
└── tsconfig.json
```

---

## Configuração e Execução

### Variáveis de Ambiente (`.env.example`)
- `EXPO_PUBLIC_CUIDADO_API_URL`: API .NET (`http://localhost:5080/api/v1`)
- `EXPO_PUBLIC_MONITOR_API_URL`: API Java (`http://localhost:8080/api/v1`)
- `EXPO_PUBLIC_INSIGHTS_API_URL`: API Python FastAPI (`http://localhost:8000/api/v1`)

### Passo a Passo
```bash
# 1. Instalar dependências
npm install

# 2. Validar tipagem TypeScript
npm run typecheck

# 3. Iniciar o Expo
npx expo start
```

### Build Android (EAS)
```bash
npx eas-cli build --profile preview --platform android
```

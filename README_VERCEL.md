# Instruções de Implantação na Vercel

Este projeto já está 100% configurado e pronto para hospedagem na **Vercel** com API Routes / Serverless Functions e persistência de dados.

---

## 1. Estrutura do Projeto

```
├── api/                        # Serverless Functions (Backend da Vercel)
│   ├── admin.ts                # Validação de senha segura via POST /api/admin
│   ├── auth.ts                 # Lógica de autenticação e geração de tokens
│   ├── storage.ts              # Persistência global (Vercel KV / Redis / JSON)
│   ├── persons.ts              # GET (público) e POST (protegido)
│   ├── reset.ts                # POST (restauração protegida)
│   └── persons/
│       └── [id].ts             # PUT (edição protegida) e DELETE (exclusão protegida)
├── src/                        # Frontend (React 19 + TypeScript + Tailwind CSS)
│   ├── components/
│   │   ├── Header.tsx          # Cabeçalho com botão "Editar" e status
│   │   ├── LoginModal.tsx      # Modal que envia a senha ao backend
│   │   ├── EditPersonModal.tsx # Edição manual de Alimentação, Reserva e Exclusão
│   │   ├── DebtTable.tsx       # Tabela completa de participantes
│   │   ├── CashFlowCard.tsx    # Saldo em conta e fluxo de caixa
│   │   └── ...
│   ├── services/
│   │   └── api.ts              # Cliente HTTP para comunicação com /api/*
│   ├── data/
│   │   └── initialData.ts      # Dados iniciais padronizados
│   └── App.tsx                 # Estado global sincronizado com o backend
├── vercel.json                 # Configuração de build e rotas da Vercel
├── .env.example                # Documentação de variáveis de ambiente
└── server.ts                   # Servidor Express Full-Stack (desenvolvimento e preview)
```

---

## 2. Variáveis de Ambiente na Vercel

No painel do seu projeto na Vercel (**Settings** -> **Environment Variables**), adicione:

1. **`ADMIN_PASSWORD`**:
   - Valor: sua senha de administrador (ex: `socorro` ou a senha que desejar).
   - O backend valida exclusivamente essa variável via `process.env.ADMIN_PASSWORD`.
   - A senha **nunca** é exposta no código do frontend (HTML/JS).

2. **Persistência Global na Vercel (Opcional - Vercel KV / Upstash)**:
   - Se desejar persistência na nuvem na Vercel para múltiplos usuários concorrentes, crie um **Vercel KV Database** (aba *Storage* na Vercel).
   - Ao conectar o KV ao projeto, a Vercel injeta automaticamente:
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
   - O arquivo `api/storage.ts` detecta essas variáveis automaticamente!
   - Em ambiente local ou enquanto o KV não estiver configurado, os dados persistem no arquivo local `data/persons.json` e cache de memória.

---

## 3. Segurança e Regras Atendidas

- **Sem senha no Frontend**: O frontend apenas envia a senha digitada para o endpoint `/api/admin`.
- **Validação Exclusiva no Backend**: Apenas o backend confere com `process.env.ADMIN_PASSWORD`.
- **Operações Protegidas**:
  - `PUT /api/persons/:id`: Edição manual dos valores de Alimentação (`expectedFood`) e Reserva (`expectedReserve`).
  - `DELETE /api/persons/:id`: Exclusão de participante da lista.
  - Ambas as rotas exigem autenticação do backend antes de alterar a base.
- **Persistência Global**: Qualquer alteração feita é salva no backend e refletida para todos os usuários que acessarem a página.

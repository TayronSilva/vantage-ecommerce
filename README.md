# Vantage E-commerce

Monorepo de e-commerce full-stack: **frontend em React (Vite)** e **backend em NestJS**. Loja com catálogo, carrinho, checkout, pagamentos (Mercado Pago: PIX, cartão, boleto), gestão de usuários, pedidos e painel admin.

---

## Índice

- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Banco de dados](#banco-de-dados)
- [Como rodar](#como-rodar)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Funcionalidades principais](#funcionalidades-principais)
- [Deploy](#deploy)

---

## Stack

| Camada   | Tecnologia |
|----------|------------|
| **Frontend** | React 19, **Vite 5**, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend**  | NestJS 11, TypeScript, Prisma 7, PostgreSQL |
| **Auth**     | JWT (passport-jwt), perfis e permissões |
| **Pagamentos** | Mercado Pago (PIX, cartão, boleto) |
| **Storage**  | Supabase (imagens de produtos) |

**Resposta direta:** o frontend usa **Vite** (não Next.js).

---

## Pré-requisitos

- **Node.js** >= 18.x (recomendado 20.x)
- **npm** (ou yarn/pnpm)
- **PostgreSQL** (local ou Neon/Supabase/outro)
- Conta **Supabase** (bucket para imagens)
- Conta **Mercado Pago** (credenciais para pagamentos)

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/vantage-ecommerce.git
cd vantage-ecommerce

# Instale dependências do monorepo (backend + frontend)
npm install
```

---

## Variáveis de ambiente

### Backend (`apps/backend`)

Crie `apps/backend/.env` (pode copiar de `apps/backend/.env.example`):

```env
# Obrigatório
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=uma_string_longa_e_secreta_aqui

# Supabase (imagens)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...

# Opcional
PORT=3000
BCRYPT_SALT=10
MERCADO_PAGO_WEBHOOK_SECRET=  # para webhooks de notificação
```

### Frontend (`apps/frontend`)

Crie `apps/frontend/.env` (ou `.env.local`):

```env
# URL da API (em dev costuma ser o backend local)
VITE_API_URL=http://localhost:3000

# Chave pública do Mercado Pago (checkout cartão)
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-...
```

Em **produção**, defina `VITE_API_URL` com a URL do backend (ex.: `https://vantage-ecommerce.onrender.com`).

---

## Banco de dados

Com PostgreSQL rodando e `DATABASE_URL` configurada:

```bash
cd apps/backend

# Gerar cliente Prisma
npx prisma generate

# Aplicar migrations
npx prisma migrate deploy

# (Opcional) Popular perfis e permissões iniciais
npx prisma db seed
```

Se não tiver migrations ainda (primeira vez):

```bash
npx prisma migrate dev --name init
```

---

## Como rodar

### Desenvolvimento (backend + frontend juntos)

Na **raiz** do repositório:

```bash
npm run dev
```

Isso sobe:

- **Backend:** http://localhost:3000  
- **Frontend (Vite):** http://localhost:5173 (ou a porta que o Vite mostrar)

### Apenas um dos apps

```bash
# Só backend
npm run dev:backend

# Só frontend (precisa do backend rodando para API e login)
npm run dev:frontend
```

O frontend em dev usa `VITE_API_URL`; se não definir, assume `http://localhost:3000`.

---

## Scripts disponíveis

Na **raiz** do projeto:

| Comando | Descrição |
|--------|-----------|
| `npm run dev` | Sobe backend e frontend em paralelo |
| `npm run dev:backend` | Sobe só o backend (NestJS) |
| `npm run dev:frontend` | Sobe só o frontend (Vite) |
| `npm run build:backend` | Build do backend |
| `npm run build:frontend` | Build do frontend (Vite) |
| `npm run install:all` | `npm install` (workspaces) |

Dentro de `apps/backend`:

- `npm run start:dev` — backend em watch
- `npm run build` — compila NestJS
- `npx prisma studio` — interface para ver/editar o banco

Dentro de `apps/frontend`:

- `npm run dev` — Vite em modo dev
- `npm run build` — build de produção
- `npm run preview` — preview do build

---

## Estrutura do projeto

```
vantage-ecommerce/
├── package.json          # Monorepo (workspaces: apps/*)
├── README.md             # Este arquivo
├── apps/
│   ├── backend/         # NestJS (API, auth, pedidos, pagamentos)
│   │   ├── prisma/
│   │   ├── src/
│   │   ├── .env.example
│   │   └── package.json
│   └── frontend/        # React + Vite
│       ├── src/
│       │   ├── components/
│       │   ├── views/
│       │   ├── services/
│       │   └── context/
│       ├── index.html
│       └── package.json
```

---

## Funcionalidades principais

- **Loja:** home, listagem, produto, carrinho, checkout.
- **Usuário:** registro, login, perfil, endereços, pedidos, trocas/devoluções, lista de desejos.
- **Pagamentos (Mercado Pago):** PIX (com desconto), cartão de crédito, boleto.
- **Admin:** dashboard, pedidos, produtos, estoque, usuários internos, perfis/permissões, relatórios, moderação de reviews.
- **Desativação de usuário:** admin pode desativar conta de usuário (rota `PATCH /users/:id/deactivate`); usuário desativado não consegue mais fazer login.

Para detalhes das rotas da API, veja `apps/backend/README.md` e `apps/backend/ROTAS_COMPLETAS.md`.

---

## Deploy

- **Backend:** por exemplo **Render** (ou outro host Node). Configure `PORT`, `DATABASE_URL`, `JWT_SECRET`, Supabase e Mercado Pago. Rode migrations antes do start (`prisma migrate deploy`).
- **Frontend:** por exemplo **Vercel** ou **Netlify**. Build: `npm run build` (em `apps/frontend`). Defina `VITE_API_URL` com a URL do backend em produção e `VITE_MERCADO_PAGO_PUBLIC_KEY` com a chave pública de produção.

---

## Licença

Uso conforme definido no repositório (ex.: privado ou MIT).

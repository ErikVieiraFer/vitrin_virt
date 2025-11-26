# Painel Admin Master - Vitrine Virtual

Painel administrativo master completo para gerenciar todos os clientes (tenants) do sistema Vitrine Virtual.

## 🚀 Tecnologias

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (componentes)
- **Firebase Authentication** (admin)
- **Firebase Firestore** (admin queries)
- **Firebase Admin SDK** (server-side)
- **React Hook Form + Zod**
- **Recharts** (gráficos)
- **Lucide React** (ícones)
- **date-fns** (datas)

## 📋 Funcionalidades

### ✅ Autenticação Admin
- Login com email/senha
- Verificação de permissões admin no Firestore
- Custom claims para segurança
- Proteção de rotas

### ✅ Dashboard
- Métricas globais (clientes, agendamentos, conversão)
- Gráficos de crescimento (Recharts)
- Cards de estatísticas com trends
- Lista de clientes recentes

### ✅ Gestão de Clientes (Tenants)
- Listar todos os clientes
- Criar novo cliente
- Editar informações do cliente
- Ativar/desativar clientes
- Ver estatísticas individuais
- **Impersonate** (acessar painel do cliente)

### ✅ Analytics
- Métricas avançadas
- Gráficos de crescimento
- Top clientes mais ativos
- Período selecionável

### ✅ Agendamentos Globais
- Visualizar todos os agendamentos do sistema
- Filtros por cliente, status, data
- Busca por nome do cliente final

### ✅ Activity Logs
- Timeline de eventos do sistema
- Filtros por tipo e período
- Registro automático de ações

### ✅ Configurações
- Configurações globais do sistema
- Lista de admins
- Email de suporte

## 📦 Instalação

### 1. Clone o repositório

```bash
cd painel-admin-master
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Firebase:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"

# Admin Email
ADMIN_EMAIL=seu@email.com

# Client Panel URL (para impersonate)
NEXT_PUBLIC_CLIENT_PANEL_URL=http://localhost:3001
```

### 4. Configure o Firebase

#### 4.1. Crie um projeto no Firebase Console
- Acesse https://console.firebase.google.com
- Crie um novo projeto

#### 4.2. Ative o Firestore
- No menu lateral, clique em "Firestore Database"
- Clique em "Criar banco de dados"
- Escolha o modo de produção

#### 4.3. Ative a Authentication
- No menu lateral, clique em "Authentication"
- Clique em "Começar"
- Ative o método de login "Email/Senha"

#### 4.4. Obtenha as credenciais do Firebase Admin SDK
- Acesse "Configurações do Projeto" > "Contas de Serviço"
- Clique em "Gerar nova chave privada"
- Salve o arquivo JSON
- Copie as informações para o `.env.local`:
  - `projectId` → `FIREBASE_ADMIN_PROJECT_ID`
  - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
  - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (mantenha as quebras de linha `\n`)

#### 4.5. Crie a collection `admins` no Firestore

No Firestore, crie manualmente a collection `admins` com um documento usando seu email:

```
Collection: admins
Document ID: seu@email.com
Fields:
  - email: "seu@email.com"
  - name: "Seu Nome"
  - created_at: [timestamp atual]
```

### 5. Execute o projeto

```bash
npm run dev
```

O painel estará disponível em http://localhost:3002

## 🗂️ Estrutura do Projeto

```
painel-admin-master/
├── src/
│   ├── app/
│   │   ├── (auth)/login/          # Página de login
│   │   ├── (dashboard)/           # Páginas protegidas
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── tenants/           # Gestão de clientes
│   │   │   ├── analytics/         # Analytics
│   │   │   ├── bookings/          # Agendamentos
│   │   │   ├── activity/          # Activity logs
│   │   │   └── settings/          # Configurações
│   │   └── api/admin/stats/       # API stats
│   │
│   ├── components/
│   │   ├── ui/                    # Componentes shadcn/ui
│   │   ├── sidebar-master.tsx     # Sidebar do admin
│   │   ├── header-master.tsx      # Header do admin
│   │   ├── stats-card.tsx         # Card de estatísticas
│   │   ├── tenant-card.tsx        # Card de cliente
│   │   ├── analytics-chart.tsx    # Gráficos
│   │   └── activity-log-item.tsx  # Item de log
│   │
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts          # Firebase client
│   │   │   ├── admin-config.ts    # Firebase Admin SDK
│   │   │   ├── admin-auth.ts      # Funções de auth admin
│   │   │   └── admin-firestore.ts # Queries Firestore
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-admin-auth.ts  # Hook de autenticação
│   │   │   └── use-tenants.ts     # Hook de clientes
│   │   │
│   │   └── utils.ts               # Utilitários
│   │
│   └── types/                     # TypeScript types
│
├── .env.local.example
├── package.json
└── README.md
```

## 🔐 Segurança

### Verificação de Admin

O painel verifica se o usuário é admin em duas camadas:

1. **Collection `admins`**: Documento no Firestore com o email do admin
2. **Custom Claims**: Claims personalizados no Firebase Auth

### Proteção de Rotas

- Layout do dashboard verifica autenticação e status de admin
- Redirect automático para login se não autenticado
- Middleware para proteção adicional

## 🎨 Design

- **Cor primária**: Purple (diferente do painel cliente)
- **Sidebar**: Roxo escuro (#8b5cf6)
- **Componentes**: shadcn/ui com tema customizado
- **Responsivo**: Mobile-first design

## 📊 Collections do Firestore

### `admins`
```typescript
{
  email: string;
  name: string;
  created_at: Timestamp;
}
```

### `tenants`
```typescript
{
  name: string;
  subdomain: string;
  email: string;
  whatsapp: string;
  logo_url?: string;
  active: boolean;
  theme: {
    primary_color: string;
    secondary_color: string;
    font: string;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### `bookings`
```typescript
{
  tenant_id: string;
  tenant_name: string;
  service_id: string;
  service_name: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  date: Timestamp;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### `activity_logs`
```typescript
{
  type: ActivityType;
  tenant_id?: string;
  tenant_name?: string;
  description: string;
  metadata?: object;
  created_at: Timestamp;
}
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Importe o projeto no Vercel
3. Configure as variáveis de ambiente no Vercel
4. Deploy!

### Outras plataformas

O projeto Next.js pode ser deployado em qualquer plataforma que suporte Node.js:
- AWS Amplify
- Google Cloud Run
- Railway
- Render

## 📝 Notas de Desenvolvimento

### Adicionar novo admin

Execute no console do Firebase ou crie uma função:

```javascript
// Adicionar ao Firestore
db.collection('admins').doc('email@exemplo.com').set({
  email: 'email@exemplo.com',
  name: 'Nome do Admin',
  created_at: admin.firestore.FieldValue.serverTimestamp()
});
```

### Impersonate

O sistema permite que o admin acesse o painel de qualquer cliente:

1. Clique em "Acessar Painel" no card do cliente
2. Será redirecionado para o painel do cliente com token de impersonate
3. O painel do cliente deve ter lógica para aceitar e autenticar com esse token

## 🐛 Troubleshooting

### Erro ao fazer login

- Verifique se o email está na collection `admins`
- Verifique as credenciais do Firebase no `.env.local`
- Verifique se a Authentication está ativada no Firebase

### Erro ao carregar clientes

- Verifique se o Firestore está configurado
- Verifique as permissões do Firebase Admin SDK
- Verifique se a collection `tenants` existe

### Gráficos não aparecem

- Verifique se `recharts` está instalado: `npm install recharts`
- Verifique se há dados para exibir

## 📄 Licença

Este projeto foi criado para o sistema Vitrine Virtual.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Suporte

Para suporte, entre em contato através do email configurado nas variáveis de ambiente.

---

**Desenvolvido com ❤️ para Vitrine Virtual**
# painel-admin-master

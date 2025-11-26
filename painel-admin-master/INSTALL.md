# Guia de Instalação Rápida - Painel Admin Master

## ⚡ Quick Start

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Firebase.

### 3. Configurar Firebase

#### a) Criar projeto no Firebase Console
- Acesse: https://console.firebase.google.com
- Clique em "Adicionar projeto"
- Siga o wizard de criação

#### b) Ativar Firestore
- Menu → Firestore Database → Criar banco de dados
- Modo: Produção
- Localização: escolha a mais próxima

#### c) Ativar Authentication
- Menu → Authentication → Começar
- Método: Email/Senha → Ativar

#### d) Obter credenciais do Client SDK
- Configurações do Projeto → Geral
- Seção "Seus apps" → Web (ícone </>)
- Copie as credenciais para `.env.local`:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  ```

#### e) Obter credenciais do Admin SDK
- Configurações do Projeto → Contas de Serviço
- Gerar nova chave privada (baixa arquivo JSON)
- Copie do JSON para `.env.local`:
  ```
  FIREBASE_ADMIN_PROJECT_ID=project_id
  FIREBASE_ADMIN_CLIENT_EMAIL=client_email
  FIREBASE_ADMIN_PRIVATE_KEY="private_key_com_quebras_de_linha"
  ```

### 4. Criar Primeiro Admin

No Firestore Console:

1. Crie a collection `admins`
2. Adicione um documento com ID = seu email
3. Campos:
   ```
   email: "seu@email.com"
   name: "Seu Nome"
   created_at: [timestamp atual]
   ```

### 5. Criar Usuário no Firebase Auth

No Authentication Console:

1. Aba "Users"
2. Adicionar usuário
3. Email: `seu@email.com`
4. Senha: `sua_senha`

### 6. Executar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3002

### 7. Fazer Login

- Email: `seu@email.com`
- Senha: `sua_senha`

## ✅ Checklist de Validação

- [ ] Firebase projeto criado
- [ ] Firestore ativado
- [ ] Authentication ativada
- [ ] Collection `admins` criada
- [ ] Usuário admin criado no Auth
- [ ] Variáveis de ambiente configuradas
- [ ] `npm install` executado
- [ ] Servidor rodando em http://localhost:3002
- [ ] Login funciona
- [ ] Dashboard carrega

## 🚨 Problemas Comuns

### "Usuário não autorizado"
- Verifique se o email está na collection `admins`
- Email no Auth e no Firestore devem ser idênticos

### "Firebase not initialized"
- Verifique as variáveis de ambiente
- Certifique-se de que o arquivo `.env.local` existe
- Reinicie o servidor (`npm run dev`)

### "Private key error"
- A chave privada deve manter as quebras de linha (`\n`)
- Use aspas duplas no `.env.local`
- Exemplo correto:
  ```
  FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
  ```

### Erro ao carregar tenants
- Crie a collection `tenants` manualmente no Firestore
- Ou crie um tenant pela interface (botão "Novo Cliente")

## 📚 Próximos Passos

1. **Criar clientes de teste**: Dashboard → Clientes → Novo Cliente
2. **Explorar métricas**: Dashboard → Analytics
3. **Configurar regras do Firestore**: Ver seção abaixo
4. **Deploy**: Ver README.md para instruções de deploy

## 🔒 Regras de Segurança do Firestore (Produção)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins collection - apenas leitura
    match /admins/{email} {
      allow read: if request.auth != null;
      allow write: if false; // Criar admins apenas manualmente
    }

    // Tenants - admin pode tudo
    match /tenants/{tenantId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));

      // Services subcollection
      match /services/{serviceId} {
        allow read, write: if request.auth != null;
      }
    }

    // Bookings - admin pode tudo
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }

    // Activity logs - apenas admin pode ler
    match /activity_logs/{logId} {
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
      allow write: if false; // Criado apenas via Admin SDK
    }
  }
}
```

Aplique essas regras em: Firebase Console → Firestore → Regras

## 🎉 Pronto!

Seu Painel Admin Master está configurado e pronto para uso!

Para mais informações, consulte o `README.md`.

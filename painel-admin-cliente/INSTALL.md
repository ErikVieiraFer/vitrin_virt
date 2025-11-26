# Guia de Instalação Rápida

## Passo 1: Instalar Dependências

```bash
npm install
```

## Passo 2: Configurar Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative os seguintes serviços:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**

## Passo 3: Obter Credenciais do Firebase

1. No Firebase Console, vá em **Configurações do Projeto** (ícone de engrenagem)
2. Role até **Seus apps** e clique em **</> Web**
3. Copie as credenciais do objeto `firebaseConfig`

## Passo 4: Configurar Variáveis de Ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Passo 5: Configurar Regras de Segurança

### Firestore Rules

No Firebase Console > Firestore Database > Regras, cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tenants/{tenantId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.ownerUid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.ownerUid;
    }

    match /services/{serviceId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/tenants/$(resource.data.tenantId)) &&
        get(/databases/$(database)/documents/tenants/$(resource.data.tenantId)).data.ownerUid == request.auth.uid;
    }

    match /availability/{availabilityId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/tenants/$(resource.data.tenantId)) &&
        get(/databases/$(database)/documents/tenants/$(resource.data.tenantId)).data.ownerUid == request.auth.uid;
    }

    match /bookings/{bookingId} {
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/tenants/$(resource.data.tenantId)) &&
        get(/databases/$(database)/documents/tenants/$(resource.data.tenantId)).data.ownerUid == request.auth.uid;
      allow create: if true;
    }
  }
}
```

### Storage Rules

No Firebase Console > Storage > Regras, cole:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tenants/{tenantId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        firestore.get(/databases/(default)/documents/tenants/$(tenantId)).data.ownerUid == request.auth.uid;
    }
  }
}
```

## Passo 6: Rodar o Projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Passo 7: Criar Primeira Conta

1. Acesse `http://localhost:3000`
2. Clique em "Cadastre-se"
3. Preencha os dados:
   - Nome da empresa
   - Subdomínio (único, ex: "meunegocios")
   - Email
   - Senha
4. Clique em "Criar Conta"

Pronto! Você será redirecionado para o dashboard.

## Troubleshooting

### Erro de permissão no Firestore

- Verifique se as regras de segurança estão corretas
- Certifique-se de que o Authentication está ativado

### Erro ao fazer upload de imagens

- Verifique se o Storage está ativado
- Confirme que as regras de Storage estão configuradas

### Erro "Firebase: Error (auth/...)"

- Verifique se as credenciais no `.env.local` estão corretas
- Certifique-se de que o método Email/Password está ativado no Authentication

## Próximos Passos

1. Cadastre seus serviços
2. Configure seus horários de disponibilidade
3. Personalize as cores e logo do seu site
4. Compartilhe o link do site com seus clientes

## Deploy (Opcional)

### Vercel

```bash
npm install -g vercel
vercel
```

Configure as variáveis de ambiente no painel da Vercel.

### Netlify

```bash
npm run build
```

Faça upload da pasta `.next` no Netlify e configure as variáveis de ambiente.

---

Qualquer dúvida, consulte o README.md principal.

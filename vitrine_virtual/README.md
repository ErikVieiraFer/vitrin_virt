# Vitrine Virtual - Sistema de Agendamentos White-Label Multi-Tenant

Sistema completo de agendamentos desenvolvido em Flutter com arquitetura Clean Architecture, Firebase e suporte multi-tenant.

## Características Principais

- **Multi-Tenant**: Suporte para múltiplos clientes com subdomínios personalizados
- **White-Label**: Personalização completa de cores, logo e fontes por tenant
- **Clean Architecture**: Separação clara de responsabilidades em camadas
- **State Management**: Cubit (flutter_bloc) para gerenciamento de estado
- **Firebase**: Backend completo com Firestore
- **Responsivo**: Suporte para web, mobile e tablet

## Variáveis de Ambiente

Este projeto utiliza variáveis de ambiente para configurar a conexão com o Firebase.

1. Crie um arquivo `.env` na raiz do projeto.
2. Copie o conteúdo de `.env.example` para o novo arquivo `.env`.
3. Preencha as variáveis com as suas credenciais do Firebase:

- `FIREBASE_API_KEY`
- `FIREBASE_APP_ID`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_AUTH_DOMAIN`

### Stripe

- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Deploy

O deploy da aplicação web é feito através da Vercel.

**Comando para deploy:**

```bash
vercel --prod
```

**Configuração (vercel.json):**

```json
{
  "buildCommand": "flutter build web --release",
  "outputDirectory": "build/web",
  "installCommand": "echo 'Flutter SDK required'",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

## Licença

Este projeto é privado e proprietário.

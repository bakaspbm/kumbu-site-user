# Kumbú — Site utilizador

Versão web do app mobile [`kumbu_app_user`](../kumbu_app_user): mesma navegação, loja e conta — **não é painel de administração**.

## Experiência (como o app)

| Separador | Rota |
|-----------|------|
| Início | `/` |
| Categorias | `/search` |
| Carrinho | `/cart` |
| Pedidos | `/orders` |
| Perfil | `/profile` |

Rotas extra: `/product/[id]`, `/store-category/[id]`, `/login`, `/checkout`, etc.

## Desenvolvimento

```bash
npm install
cp .env.local.example .env.local
# Mesmas credenciais Supabase do app (supabase.local.json)
npm run dev
```

[http://localhost:3000](http://localhost:3000) abre directamente a **home** do utilizador.

## Produção

```bash
npm run build
npm start
```

Rotas antigas `/loja/*` redireccionam automaticamente para as novas.

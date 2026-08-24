# Contexto AI — Site (Kumbu_site_user)

**Chat novo:** `AGENTS.md` → **`docs/CURRENT_WORK.md`** → `.cursor/rules/`.

**Guia completo da plataforma:** `../Kumbu_bakend/docs/PROJECT_GUIDE.md`  
**Regras Cursor:** `.cursor/rules/*.mdc` (sincronizadas a partir do backend)

## Este repo

- Produção: https://www.kumbu-market.com
- Vercel: `kumbu-site-user`
- Dev: `npm run dev` (:3000)
- Deploy: `npx vercel deploy --prod --yes`

## Caminhos importantes

- i18n: `src/messages/{pt,en,fr}.json`
- API client: `src/lib/kumbu-api/`
- Publicar anúncio: `/publicar` — **só imagens**
- Proxy auth: `/api/kumbu/`

## Backend / infra

Alterações API ou VPS → repo `Kumbu_bakend`. Ver `../Kumbu_bakend/docs/AI_CONTEXT.md`.

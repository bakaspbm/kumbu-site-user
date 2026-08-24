# Estado actual do trabalho (handoff entre chats / modelos)

**Actualizar este ficheiro** no fim de cada tarefa relevante.  
Outros chats devem lê-lo **primeiro** para não repetir, reverter ou baralhar.

Última actualização: **2026-08-24** (directório Kumbú no publicar)

---

## Em produção (não desfazer sem motivo)

| Área | O quê | Onde |
|------|--------|------|
| Directório no publicar | Marca/modelo/vaga: sugestões da API Kumbú (PostgreSQL), não APIs externas. «Adicionar manualmente» se não existir. | Site + API |
| Características por categoria | Quarto sem contagens irrelevantes; beleza com estado selado/aberto + marcas JSON; moda com marcas; limpar attrs ao mudar categoria. | Site |
| Vídeos no publicar | Até 3 vídeos opcionais (≤1 min, ≤40 MB, MP4/WEBM/MOV). API `videoUrls` + V36; validação estrita fotos/vídeos. | API + site |
| Fix Facebook OAuth | Callback: login via API `/auth/oauth/facebook/code` (proxy); fallback Vercel+`originAwareFetch`; null-safety em tokens (`accessToken` de null). | Site |
| Telefone formato AO | Campo Telefone: select +244, máx. 9 dígitos, espaços ao escrever (`923 456 789`), validação móvel (começa por 9). Perfil, CV, login telefone. | Site |
| Fix Comprei / deal / reviews | «Comprei», rejeitar, anexos chat e avaliações via browser (não server action). | Site + API |
| Veículos marca→modelo | Catálogo offline VehiclesDB (CC-BY): carros/SUV, comerciais, motas. Marca → modelos. `src/lib/catalog/vehicles/` | Site |
| Marcas no publicar | Autocomplete outras cats: telemóveis, PCs, tablets, TV, gaming, eletrodomésticos. `src/lib/catalog/brands/` | Site |
| Fix logout ao contactar | «Enviar mensagem» / chat no browser (cookies/proxy), não server action — evita falso login. | Site |
| i18n anúncios EN/FR | Chaves em falta (`tabActive`, `markOutOfStock`, `viewPublicProfile`, formulário editar, tabs perfil vendedor, etc.) sincronizadas com `pt` | Site (`en.json` / `fr.json`) |
| Origem online (web/app) | Login deixa de forçar `APP`; site/admin enviam `source: web`; admin tem heartbeat de presença; WS passa `X-Kumbu-Client` | API + admin + site |
| Preços na UI | `formatPriceLabel` → milhares + `Kz` (ex. `5 000 000 Kz`) | Site (`utils.ts`, cards, publish) |
| Sessão / conta | Hang «A restaurar sessão…» / «A carregar…»: limpa marcadores stale, timeouts auth, `X-Kumbu-Client` p/ WebViews (Instagram), `redirect()` fora de `try/catch` em VIP/pagamentos | Site |
| Visitantes anónimos | `POST /platform/visitor-presence` + Redis/memória + `site_visitor_daily` (V32). Admin: dashboard + `/users/online` mostram online/hoje/ontem/7 dias. Site: `VisitorPresenceBeacon` | API + site + admin |
| Admin: apagar conta completa | Soft-delete = desactivar (recuperável). Hard delete: `DELETE /api/v1/admin/users/{id}/permanent` (só Super Admin). Admin UI: modal + confirmar com `APAGAR` | API + admin |
| Email Hostinger | DNS MX/SPF/DKIM/DMARC OK. Caixa `hello@`; aliases `suporte@` (+ opcional `support@`). Site usa `suporte@kumbu-market.com` | Hostinger + site |
| Emails app (API) | Resend (`noreply@kumbu-market.com`) — separado da inbox Hostinger | API |
| Admin: caixa email | Inbox só leitura via IMAP: `GET /admin/mailbox/messages`. UI `/support/mailbox`. Activar: editar `/home/deploy/kumbu-mail-imap.env` (`ENABLED=true` + password `hello@`) e `docker restart kumbu-api` | API + admin |

## Em curso / aberto

- Staging API fica **desligado por defeito** (RAM VPS) — ligar só quando precisar (`docs/STAGING.md`).
- Deploy `--skip-docker-build`: recrear container **parado**, copiar JAR, depois `start` (evita ClassNotFound antes do `docker cp`).
- **IMAP admin:** password da caixa `hello@` ainda por pôr em `/home/deploy/kumbu-mail-imap.env` para a inbox deixar de mostrar «não configurada».

## Regras de ouro (não negociar)

1. Utilizadores reais em prod → **compat aditiva** (nullable / opcional).
2. Deploy: build → staging → smoke → prod (`.cursor/rules/kumbu-production-gate.mdc`).
3. Docker Hub 429 no VPS → `vps-deploy-jar.py --skip-docker-build` (copia JAR para o container).
4. Commit só com pedido explícito do utilizador.
5. Não inventar URLs/credenciais — ver `.cursor/rules/kumbu-platform.mdc`.

## Como continuar num chat novo

```
1. Abrir o repo certo (API vs site vs admin)
2. Ler docs/CURRENT_WORK.md
3. Ler docs/AI_CONTEXT.md
4. Só então implementar o pedido do utilizador
5. No fim: actualizar esta secção (Em produção / Em curso)
```

## Pointers

- Guia completo: `docs/PROJECT_GUIDE.md`
- Staging: `docs/STAGING.md`
- Índice AI: `docs/AI_CONTEXT.md`
- Entrada agentes: `AGENTS.md` (raiz do repo)

# Manual de Infraestrutura - Geraldo Luiz Terapeuta

Este documento serve para garantir a estabilidade do projeto e evitar retrabalho ou "tentativa e erro" em futuras manutenções.

## 🛠️ Stack Técnica
- **Framework**: Astro v6 (SSR Mode)
- **Adapter**: `@astrojs/cloudflare`
- **Banco de Dados**: Appwrite (Projeto NetCidade)
- **Hospedagem**: Cloudflare Pages

---

## 🔐 Gestão de Ambiente (Variáveis)

### 1. Padrão Astro v6 (Obrigatório)
**NUNCA** utilize `Astro.locals.runtime.env`. No Astro 6, o acesso em produção deve ser feito via o módulo oficial:
```typescript
import { env } from 'cloudflare:workers';
```
O arquivo `src/lib/appwrite.ts` já centraliza isso na função `mergeEnv()`.

### 2. Wrangler vs Cloudflare Dashboard
As variáveis de ambiente **não devem ser fixadas** no `wrangler.jsonc` se você pretende alterá-las pelo painel do Cloudflare. 
- O arquivo `wrangler.jsonc` atual está configurado para **não sobrescrever** as configurações do Dashboard.
- **Dica**: Sempre que mudar uma chave, mude no Painel do Cloudflare (Settings > Variables) e no seu `.env` local.

---

## 🗄️ Estrutura do Appwrite

### Coleção: `site_content`
- **Documento `pages`**: Contém o coração do site.
  - A estrutura do JSON em `data` segue o padrão:
    - `home.hero`: Títulos e imagem do topo.
    - `home.site_content.diferenciais`: Array com os 5 cards (Ícones cadastrados: `ShieldCheck`, `Infinity`, `Zap`, `GraduationCap`, `Cpu`).
- **Documento `contato`**: WhatsApp, e-mail e endereço.

### Coleção: `products`
- Contém as especialidades. O código no `index.astro` faz o parse automático do campo `data`.

---

## 🎨 Ícones e UI
O projeto utiliza um `IconMap` customizado no `index.astro`. Novos ícones devem ter seus caminhos SVG adicionados lá e também no `ICON_LIST` do arquivo `src/pages/admin/paginas.astro` para que apareçam no Painel Admin.

---
**Nota de Engenharia**: Este projeto foi estabilizado após a migração para o Astro 6. Mantenha as funções do Appwrite síncronas para evitar refatorações em massa.

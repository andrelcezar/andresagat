# André Sagat Muaythai GYM

Site institucional da André Sagat Muaythai GYM — academia de Muay Thai em São Paulo/SP. É um site estático (HTML, CSS e JavaScript puros, sem build step), publicado via GitHub Pages.

🔗 **Produção:** https://andrelcezar.github.io/andresagat/

## Estrutura do projeto

```
.
├── index.html        # Página principal (home) — HTML, CSS e JS 100% inline
├── blog.html          # Blog público (eventos e novidades)
├── blog_adm.html      # Painel administrativo do blog (área restrita)
├── robots.txt
├── sitemap.xml
└── assets/            # Imagens (fotos da equipe, logo, patrocinadores etc.)
```

Cada página HTML é autocontida: o CSS fica em uma tag `<style>` e o JavaScript em uma tag `<script>` no próprio arquivo, sem dependências de build (não há `npm install`, bundler ou pré-processador). As únicas dependências externas são carregadas via CDN:

- [Google Fonts](https://fonts.google.com/) (Bebas Neue, Oswald, Inter)
- [Font Awesome 6](https://fontawesome.com/) (ícones)
- [EmailJS](https://www.emailjs.com/) (envio de e-mail direto do navegador, sem backend)

## Como rodar localmente

Não há processo de build. Basta servir os arquivos estáticos:

```bash
python3 -m http.server 8000
# ou
npx serve .
```

Depois acesse `http://localhost:8000/index.html`.

## Páginas

### `index.html` — Site principal
Landing page completa: hero, sobre, horários, modalidades, planos, equipe, eventos, patrocinadores, formulário de matrícula (com popup de agendamento de aula experimental) e contato.

### `blog.html` — Blog público
Lista eventos e novidades publicados. Os dados vêm do `localStorage` do navegador (chave `sagat_blog_posts`).

### `blog_adm.html` — Painel administrativo
Área restrita (`/blog_adm.html`, não linkada na navegação pública) para criar/editar posts do blog. Login local simples (usuário/senha definidos no próprio arquivo).

> ⚠️ **Limitação importante:** o painel grava os posts apenas no `localStorage` do navegador — não existe backend. Isso significa que um post publicado no admin só aparece **no mesmo navegador/dispositivo** que o criou; visitantes reais do site **não verão** as publicações. Para o blog funcionar de verdade em produção, é necessário um backend real ou um CMS headless.

## Configuração necessária (EmailJS)

O formulário de matrícula e o agendamento de aula experimental usam o [EmailJS](https://www.emailjs.com/) para enviar e-mails direto do navegador. As chaves em `index.html` ainda estão com valores de placeholder:

```js
const EJS_PUBLIC_KEY    = 'YOUR_PUBLIC_KEY';
const EJS_SERVICE_ID    = 'YOUR_SERVICE_ID';
const EJS_TMPL_ACADEMIA = 'template_academia';
const EJS_TMPL_ALUNO    = 'template_aluno';
```

Para ativar o envio de e-mail:

1. Crie uma conta gratuita em [emailjs.com](https://www.emailjs.com/).
2. Crie um Email Service conectado ao Gmail da academia (`studiodemuaythai@gmail.com`).
3. Crie dois Email Templates: `template_academia` (notificação para a academia) e `template_aluno` (boas-vindas/instruções para o aluno).
4. Substitua os valores acima pelos IDs reais gerados pelo EmailJS.

Enquanto isso não for feito, os formulários caem automaticamente em um fallback (abrir e-mail via `mailto:` ou WhatsApp) para que nenhum contato seja perdido.

## Segurança

- A senha de acesso ao painel admin (`blog_adm.html`) fica em texto plano no próprio HTML — como não há backend, isso não pode ser tornado realmente seguro sem adicionar um. Não trate essa área como protegida contra alguém com acesso técnico.
- Conteúdo de posts do blog é sanitizado (`escapeHtml`) antes de ser inserido no DOM.

## Deploy

O deploy é feito publicando os arquivos estáticos no GitHub Pages a partir da branch `main`. Não há pipeline de CI/build — qualquer alteração enviada para `main` já reflete em produção.

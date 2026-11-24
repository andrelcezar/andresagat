# André Sagat Muaythai GYM

Site estático da academia, publicado pelo [GitHub Pages](https://andrelcezar.github.io/andresagat/) a partir da branch `main`.

## Testar localmente

Execute `python3 -m http.server 8000` na raiz e abra `http://localhost:8000/`. O blog carrega as publicações por HTTP.

## Publicar no blog

Edite `posts.json` em um pull request. Cada publicação precisa de `type` (`evento` ou `novidade`), `title` e `createdAt` (AAAA-MM-DD). Eventos usam `eventDate` no mesmo formato. Há campos opcionais para `excerpt`, `image`, `local`, `tags`, `isFight` e `link`. Envie imagens públicas junto com o post em `assets/`.

A home mostra os próximos eventos e até três novidades recentes. O blog mantém o histórico. Após a publicação, abra a home e o blog em um navegador com sessão nova.

Posts do painel antigo ficaram no navegador que os criou. Para recuperar esse conteúdo, exporte os posts desse navegador antes de descartar seu perfil, revise-os e inclua os posts aprovados no arquivo do blog.

## Matrícula e aula experimental

O visitante revisa e envia sua mensagem pelo WhatsApp. A equipe responde com a disponibilidade e orienta sobre matrícula e Nextfit. Revise o telefone e a grade ao alterar o atendimento.

## Indexação

O sitemap público está em `/andresagat/sitemap.xml`. Envie seu endereço no Google Search Console da propriedade correspondente. Um `robots.txt` válido para o domínio precisa ser publicado na raiz do host do GitHub Pages ou de um domínio próprio.

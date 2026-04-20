# Deploy

## Melhor caminho para este projeto hoje

Este projeto usa Next.js + Prisma + PostgreSQL, mas ainda grava evidencias e logs
de auditoria em arquivos JSON dentro da pasta `data/`.

Por isso, o caminho mais seguro para publicar agora e usar um deploy com volume
persistente, como Railway ou Render.

## Variaveis de ambiente

Configure estas variaveis no provedor:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
DATA_DIR=/app/data
```

Em desenvolvimento local, `DATA_DIR` pode continuar como `./data`.

## Railway

1. Conecte o repositorio no Railway.
2. Escolha deploy por `Dockerfile`.
3. Adicione a variavel `DATABASE_URL`.
4. Adicione a variavel `DATA_DIR=/app/data`.
5. Crie um volume e monte em `/app/data`.
6. Publique o servico.

## Render

1. Crie um `Web Service` conectado a este repositorio.
2. Use o `Dockerfile` da raiz do projeto.
3. Adicione a variavel `DATABASE_URL`.
4. Adicione a variavel `DATA_DIR=/app/data`.
5. Anexe um persistent disk montado em `/app/data`.
6. Publique o servico.

## Observacao sobre Vercel

Vercel e excelente para Next.js, mas este projeto ainda nao esta pronto para esse
tipo de deploy porque as rotas de auditoria e evidencias escrevem no filesystem.
Em funcoes da Vercel, o filesystem e somente leitura, com excecao de `/tmp`, que
nao serve como armazenamento persistente do app.

Se voce quiser publicar na Vercel depois, o proximo passo e migrar esses JSONs da
pasta `data/` para o PostgreSQL.

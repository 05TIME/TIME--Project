cd TIME--Project npm i -g pnpm pnpm i echo {\n \scripts: {\n \dev: \pnpm --parallel --filter '.' dev\n }\n} > package.json

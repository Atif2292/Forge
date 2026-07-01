FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --production

COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

CMD ["bun", "src/index.ts"]

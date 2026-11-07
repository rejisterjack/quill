FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bunx prisma generate
RUN bun run build
ENV NODE_ENV=production
EXPOSE 7392
ENV PORT=7392
CMD ["bun", "run", "start"]

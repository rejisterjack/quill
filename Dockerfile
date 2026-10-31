FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bunx prisma generate
EXPOSE 7392
CMD ["bun", "dev", "--port", "7392"]

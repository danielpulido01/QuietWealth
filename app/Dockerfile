# QuietWealth Frontend – React 19 + Vite
FROM node:22-alpine AS deps

WORKDIR /app

# Auto-install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Development server (for local devplane environment)
FROM node:22-alpine AS dev

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD wget -qO- http://localhost:3000 || exit 1

# Run Vite dev server (hot reload available)
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]

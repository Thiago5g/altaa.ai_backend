# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client (com DATABASE_URL temporária)
RUN DATABASE_URL="postgresql://postgres:10203040@db.gwowagsruidlskhojpal.supabase.co:5432/postgres" npx prisma generate

# Expor porta
EXPOSE 4000

# Comando padrão (será sobrescrito pelo docker-compose)
CMD ["npm", "run", "start:dev"]

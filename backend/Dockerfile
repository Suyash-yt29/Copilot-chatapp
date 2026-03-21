FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

# Remove dev dependencies to keep image smaller
RUN npm prune --production

EXPOSE 5000

CMD ["npm", "start"]

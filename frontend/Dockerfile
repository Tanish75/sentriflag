FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_FLAGSMITH_ENV_KEY=FvQtv7AjNQt7uz338VJ6Yg
ARG VITE_FLAGSMITH_API_URL=http://localhost:8000/api/v1/
ENV VITE_FLAGSMITH_ENV_KEY=$VITE_FLAGSMITH_ENV_KEY
ENV VITE_FLAGSMITH_API_URL=$VITE_FLAGSMITH_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# STAGE 1
FROM node:12.16.0-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --silent --no-progress && npx ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points --loglevel error
COPY . .
RUN npm run build -- --prod --no-progress

# STAGE 2
FROM nginx:alpine
COPY --from=builder /app/dist/DWF-angular-ui /usr/share/nginx/html
COPY ./.docker/nginx.conf.template /etc/nginx/conf.d/nginx.conf.template
CMD if [[ -n "$DWF_LOCAL_MODE" ]] ; then export ES_ADDRESS=localhost:9200 ; else export ES_ADDRESS=elasticsearch:9200 ; fi ; \
  envsubst '$ES_ADDRESS'< /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf && \
  exec nginx -g 'daemon off;'

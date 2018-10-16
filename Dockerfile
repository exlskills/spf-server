FROM nginx:stable
# Install Node
RUN apt-get update
RUN apt-get install -y curl gnupg2
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
# Build app
WORKDIR /app
COPY . /app/
RUN npm install
RUN npm run build
# Setup NGINX
RUN mkdir /usr/share/nginx/html/learn-en
RUN cp -a /app/static /usr/share/nginx/html/learn-en
COPY prod-nginx.conf /etc/nginx/nginx.conf
COPY prod-nginx-site.conf /etc/nginx/conf.d/default.conf
CMD nginx -g daemon off; & npm run start:production
EXPOSE 3000
EXPOSE 80

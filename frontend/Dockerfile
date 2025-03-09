FROM node:16 as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh

# 添加执行权限
RUN chmod +x /entrypoint.sh

# 添加环境变量注入脚本的引用到 index.html
RUN sed -i 's/<head>/<head><script src="\/env.js"><\/script>/' /usr/share/nginx/html/index.html

# 暴露端口
EXPOSE 8080

# 使用我们的启动脚本
ENTRYPOINT ["/entrypoint.sh"] 
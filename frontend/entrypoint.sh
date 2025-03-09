#!/bin/sh

# 替换 nginx 配置中的后端 URL
BACKEND_URL=${REACT_APP_API_URL:-http://localhost:5002}
sed -i "s|\${BACKEND_URL}|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf

# 创建 runtime env.js
cat > /usr/share/nginx/html/env.js << EOF
window.ENV = {
  REACT_APP_API_URL: "$BACKEND_URL"
};
EOF

# 启动 nginx
nginx -g "daemon off;" 
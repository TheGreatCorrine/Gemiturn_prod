# Gemiturn AI分析系统 GCP部署指南

本文档提供了将Gemiturn AI分析系统部署到Google Cloud Platform (GCP)的详细步骤。

## 前提条件

1. 拥有Google Cloud Platform账户
2. 安装并配置Google Cloud SDK
3. 安装Docker（用于容器化应用）
4. 本地电商平台已实现必要的API端点（参见`ecommerce_api_integration.md`）

## 部署架构

我们将采用以下架构部署Gemiturn AI分析系统：

1. **App Engine**：托管后端Flask应用
2. **Cloud SQL**：托管MySQL数据库
3. **Cloud Storage**：存储退货图片和其他静态资源
4. **VPC网络**：配置安全的网络连接
5. **Cloud IAM**：管理访问权限

## 步骤1：准备GCP项目

1. 创建新的GCP项目（或使用现有项目）
   ```bash
   gcloud projects create gemiturn-ai --name="Gemiturn AI Analysis"
   gcloud config set project gemiturn-ai
   ```

2. 启用必要的API
   ```bash
   gcloud services enable appengine.googleapis.com \
       cloudsql.googleapis.com \
       storage.googleapis.com \
       aiplatform.googleapis.com \
       secretmanager.googleapis.com
   ```

## 步骤2：设置Cloud SQL

1. 创建Cloud SQL实例
   ```bash
   gcloud sql instances create gemiturn-db \
       --database-version=MYSQL_8_0 \
       --tier=db-f1-micro \
       --region=us-central1 \
       --root-password=YOUR_ROOT_PASSWORD
   ```

2. 创建数据库和用户
   ```bash
   gcloud sql databases create gemiturn --instance=gemiturn-db
   gcloud sql users create gemiturn --instance=gemiturn-db --password=YOUR_DB_PASSWORD
   ```

3. 记下连接信息
   ```
   实例连接名称: gemiturn-ai:us-central1:gemiturn-db
   数据库名称: gemiturn
   用户名: gemiturn
   密码: YOUR_DB_PASSWORD
   ```

## 步骤3：设置Cloud Storage

1. 创建存储桶
   ```bash
   gcloud storage buckets create gs://gemiturn-ai-storage --location=us-central1
   ```

2. 设置访问权限
   ```bash
   gcloud storage buckets add-iam-policy-binding gs://gemiturn-ai-storage \
       --member=serviceAccount:gemiturn-ai@appspot.gserviceaccount.com \
       --role=roles/storage.objectAdmin
   ```

## 步骤4：配置Secret Manager

1. 创建密钥
   ```bash
   echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-
   echo -n "YOUR_JWT_SECRET_KEY" | gcloud secrets create jwt-secret-key --data-file=-
   echo -n "YOUR_LOCAL_ECOMMERCE_API_KEY" | gcloud secrets create ecommerce-api-key --data-file=-
   echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-
   ```

2. 授予App Engine访问权限
   ```bash
   gcloud secrets add-iam-policy-binding db-password \
       --member=serviceAccount:gemiturn-ai@appspot.gserviceaccount.com \
       --role=roles/secretmanager.secretAccessor
   
   gcloud secrets add-iam-policy-binding jwt-secret-key \
       --member=serviceAccount:gemiturn-ai@appspot.gserviceaccount.com \
       --role=roles/secretmanager.secretAccessor
   
   gcloud secrets add-iam-policy-binding ecommerce-api-key \
       --member=serviceAccount:gemiturn-ai@appspot.gserviceaccount.com \
       --role=roles/secretmanager.secretAccessor
   
   gcloud secrets add-iam-policy-binding gemini-api-key \
       --member=serviceAccount:gemiturn-ai@appspot.gserviceaccount.com \
       --role=roles/secretmanager.secretAccessor
   ```

## 步骤5：准备应用程序

1. 更新配置文件
   编辑`backend/app.yaml`文件，确保包含以下内容：
   ```yaml
   runtime: python39
   
   env_variables:
     FLASK_ENV: "production"
     DB_USER: "gemiturn"
     DB_NAME: "gemiturn"
     CLOUD_SQL_CONNECTION_NAME: "gemiturn-ai:us-central1:gemiturn-db"
     GCP_STORAGE_BUCKET: "gemiturn-ai-storage"
     LOCAL_ECOMMERCE_API_URL: "http://your-ecommerce-platform/api"
   
   vpc_access_connector:
     name: projects/gemiturn-ai/locations/us-central1/connectors/gemiturn-connector
   
   handlers:
   - url: /.*
     script: auto
   
   entrypoint: gunicorn -b :$PORT run:app
   ```

2. 创建VPC访问连接器（如果需要访问本地资源）
   ```bash
   gcloud compute networks vpc-access connectors create gemiturn-connector \
       --region=us-central1 \
       --network=default \
       --range=10.8.0.0/28
   ```

3. 更新数据库迁移脚本
   确保`backend/migrations/cloud_sql_migration.py`文件已正确配置。

## 步骤6：部署后端应用

1. 导航到后端目录
   ```bash
   cd backend
   ```

2. 安装依赖
   ```bash
   pip install -r requirements.txt
   ```

3. 部署到App Engine
   ```bash
   gcloud app deploy
   ```

4. 迁移数据库
   ```bash
   gcloud app instances ssh --service=default --version=YOUR_VERSION -- "cd /app && python migrations/cloud_sql_migration.py"
   ```

## 步骤7：部署前端应用（可选）

如果您的前端应用也需要部署到GCP：

1. 导航到前端目录
   ```bash
   cd frontend
   ```

2. 构建生产版本
   ```bash
   npm run build
   ```

3. 部署到Firebase Hosting或App Engine
   ```bash
   # 使用Firebase Hosting
   firebase deploy
   
   # 或使用App Engine
   gcloud app deploy
   ```

## 步骤8：配置网络连接

为了让GCP上的AI分析系统能够访问本地电商平台，您需要：

1. 确保本地电商平台有公网IP地址，或
2. 设置VPN连接，或
3. 使用Cloud Interconnect连接本地网络和GCP

### 选项1：公网IP地址

如果您的本地电商平台有公网IP地址，只需确保：
- 防火墙允许来自GCP的连接
- API端点使用HTTPS加密
- 实施适当的认证和授权机制

### 选项2：设置VPN连接

1. 在GCP上创建VPN网关
   ```bash
   gcloud compute target-vpn-gateways create gemiturn-vpn-gateway \
       --region=us-central1 \
       --network=default
   ```

2. 配置本地VPN设备连接到GCP VPN网关
   （具体步骤取决于您的本地网络设备）

### 选项3：使用Cloud Interconnect

对于企业级连接，可以考虑使用Cloud Interconnect：
1. 联系Google Cloud销售团队
2. 设置专用互连或合作伙伴互连
3. 配置路由和防火墙规则

## 步骤9：测试部署

1. 访问部署的应用
   ```
   https://gemiturn-ai.appspot.com
   ```

2. 测试API连接
   ```bash
   curl -X POST https://gemiturn-ai.appspot.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
   ```

3. 测试导入功能
   ```bash
   curl -X POST https://gemiturn-ai.appspot.com/api/imports/returns \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"limit": 10}'
   ```

## 监控和维护

1. 设置日志记录
   ```bash
   gcloud logging sinks create gemiturn-logs \
       storage.googleapis.com/gemiturn-ai-logs \
       --log-filter="resource.type=gae_app AND resource.labels.module_id=default"
   ```

2. 设置监控告警
   ```bash
   gcloud alpha monitoring policies create \
       --policy-from-file=monitoring-policy.json
   ```

3. 设置定期备份
   ```bash
   gcloud sql backups create --instance=gemiturn-db
   ```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查Cloud SQL连接名称
   - 验证数据库用户名和密码
   - 确保App Engine服务账号有访问Cloud SQL的权限

2. **API连接失败**
   - 检查本地电商平台API URL
   - 验证API密钥
   - 检查网络连接（防火墙、VPN等）

3. **部署失败**
   - 检查app.yaml配置
   - 验证所有必要的API都已启用
   - 检查服务账号权限

### 获取帮助

如果您遇到问题，可以：
1. 查看App Engine日志
   ```bash
   gcloud app logs tail
   ```

2. 检查Cloud SQL日志
   ```bash
   gcloud logging read "resource.type=cloudsql_database"
   ```

3. 联系我们的技术支持团队

## 安全最佳实践

1. 定期更新所有密钥和密码
2. 启用Cloud Audit Logging
3. 实施最小权限原则
4. 定期审查防火墙规则
5. 启用VPC Service Controls（企业版）

## 成本优化

1. 设置预算提醒
   ```bash
   gcloud billing budgets create \
       --billing-account=YOUR_BILLING_ACCOUNT_ID \
       --display-name="Gemiturn Budget" \
       --budget-amount=1000USD \
       --threshold-rule=percent=0.8
   ```

2. 使用App Engine自动扩缩
3. 选择合适的Cloud SQL实例大小
4. 设置非活动实例自动休眠

## 结论

恭喜！您已成功将Gemiturn AI分析系统部署到Google Cloud Platform。系统现在可以从本地电商平台获取退货数据，进行AI分析，并将结果返回给电商平台。

如需进一步的帮助或自定义部署，请联系我们的技术支持团队。 
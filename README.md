# Gemiturn AI分析系统

Gemiturn是一个专注于退货商品AI分析的系统，可以与本地电商平台集成，提供智能化的退货处理建议。

## 项目概述

Gemiturn AI分析系统通过AI技术分析退货商品的图片和描述，自动分类退货原因，并提供处理建议（如直接再次销售、维修后再销售、退回制造商或人工审核）。系统可以与本地电商平台集成，实现退货数据的自动导入和分析。

## 系统架构

系统由以下主要组件组成：

1. **前端应用**：基于React的用户界面，用于展示退货数据和AI分析结果
2. **后端API**：基于Flask的RESTful API，处理业务逻辑和AI分析
3. **数据库**：存储退货数据和分析结果
4. **AI服务**：使用Google Gemini API进行图像和文本分析
5. **电商平台集成**：通过API与本地电商平台集成

## 主要功能

- 从电商平台导入退货数据
- AI分析退货原因和状态
- 提供处理建议和置信度
- 展示退货统计和趋势
- 支持人工审核和修改

## 技术栈

- **前端**：React, Material-UI, TypeScript
- **后端**：Python, Flask, SQLAlchemy
- **数据库**：SQLite (开发), MySQL/PostgreSQL (生产)
- **AI**：Google Gemini API
- **部署**：Google Cloud Platform (App Engine, Cloud SQL)

## 本地电商平台集成

Gemiturn AI分析系统可以与本地电商平台集成，通过API获取退货数据。集成方式如下：

1. 本地电商平台实现必要的API端点（详见`docs/ecommerce_api_integration.md`）
2. Gemiturn系统通过API从电商平台获取退货数据
3. Gemiturn系统进行AI分析，并将结果存储在自己的数据库中
4. 可选：Gemiturn系统将分析结果通过API回传给电商平台

## 部署方案

Gemiturn AI分析系统可以部署在Google Cloud Platform上，而本地电商平台保持在本地运行。部署架构如下：

1. **Gemiturn前后端**：部署在GCP App Engine上
2. **数据库**：使用GCP Cloud SQL
3. **网络连接**：通过公网API、VPN或Cloud Interconnect连接本地电商平台

详细的部署指南请参见`docs/gcp_deployment_guide.md`。

## 快速开始

### 本地开发

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/gemiturn.git
   cd gemiturn
   ```

2. 设置后端
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python migrations/create_tables.py
   python run.py
   ```

3. 设置前端
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. 访问应用
   ```
   http://localhost:3000
   ```

### 配置电商平台集成

1. 复制`.env.example`文件为`.env`
   ```bash
   cp backend/.env.example backend/.env
   ```

2. 编辑`.env`文件，设置本地电商平台API信息
   ```
   LOCAL_ECOMMERCE_API_KEY=your-api-key-here
   LOCAL_ECOMMERCE_API_URL=http://localhost:8080/api
   ```

3. 重启后端服务
   ```bash
   cd backend
   python run.py
   ```

## 文档

- [电商平台API集成指南](docs/ecommerce_api_integration.md)
- [GCP部署指南](docs/gcp_deployment_guide.md)
- [API文档](docs/api_documentation.md)
- [用户手册](docs/user_manual.md)

## 贡献

欢迎贡献代码、报告问题或提出改进建议。请遵循以下步骤：

1. Fork仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

本项目采用MIT许可证 - 详见[LICENSE](LICENSE)文件。

## 联系方式

如有任何问题或需要进一步的帮助，请联系我们的技术支持团队。

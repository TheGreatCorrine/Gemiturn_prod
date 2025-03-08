# 电商平台API集成指南

本文档提供了将本地电商平台与Gemiturn AI分析系统集成所需的API规范。

## 概述

Gemiturn AI分析系统需要从电商平台获取退货数据，进行AI分析，并将分析结果返回给电商平台。为了实现这一目标，电商平台需要提供以下API端点：

1. 认证接口
2. 获取退货列表接口
3. 获取退货详情接口
4. 获取退货图片接口
5. 更新退货状态接口

## API规范

### 基本信息

- 基础URL: `http://your-ecommerce-platform/api`
- 认证方式: API密钥 + JWT令牌
- 数据格式: JSON

### 1. 认证接口

**端点:** `/auth`

**方法:** POST

**请求体:**
```json
{
  "api_key": "your-api-key"
}
```

**响应:**
```json
{
  "token": "jwt-token",
  "expires_in": 3600
}
```

### 2. 获取退货列表接口

**端点:** `/returns`

**方法:** GET

**请求参数:**
- `start_date` (可选): 开始日期，格式为YYYY-MM-DD
- `end_date` (可选): 结束日期，格式为YYYY-MM-DD
- `status` (可选): 退货状态
- `limit` (可选): 返回结果数量限制，默认为100

**响应:**
```json
[
  {
    "id": "RET00001",
    "order_id": "ORD00001",
    "product_id": "PROD00001",
    "product_name": "产品名称",
    "product_category": "产品类别",
    "return_reason": "退货原因",
    "customer_description": "客户描述",
    "customer_email": "customer@example.com",
    "customer_phone": "13800000000",
    "status": "pending",
    "original_price": 100.0,
    "created_at": "2023-01-01 12:00:00"
  },
  // 更多退货记录...
]
```

### 3. 获取退货详情接口

**端点:** `/returns/{return_id}`

**方法:** GET

**响应:**
```json
{
  "id": "RET00001",
  "order_id": "ORD00001",
  "product_id": "PROD00001",
  "product_name": "产品名称",
  "product_category": "产品类别",
  "return_reason": "退货原因",
  "customer_description": "客户描述",
  "customer_email": "customer@example.com",
  "customer_phone": "13800000000",
  "status": "pending",
  "original_price": 100.0,
  "created_at": "2023-01-01 12:00:00",
  "updated_at": "2023-01-01 12:00:00",
  "additional_info": {
    // 任何额外信息...
  }
}
```

### 4. 获取退货图片接口

**端点:** `/returns/{return_id}/images`

**方法:** GET

**响应:**
```json
{
  "return_id": "RET00001",
  "image_urls": [
    "http://your-ecommerce-platform/images/return_1_1.jpg",
    "http://your-ecommerce-platform/images/return_1_2.jpg"
  ]
}
```

### 5. 更新退货状态接口

**端点:** `/returns/{return_id}/status`

**方法:** PUT

**请求体:**
```json
{
  "status": "processed",
  "notes": "AI分析完成"
}
```

**响应:**
```json
{
  "success": true,
  "return_id": "RET00001",
  "status": "processed"
}
```

## 数据字段说明

### 退货记录字段

| 字段名 | 类型 | 描述 |
|-------|------|------|
| id | 字符串 | 退货ID |
| order_id | 字符串 | 订单ID |
| product_id | 字符串 | 产品ID |
| product_name | 字符串 | 产品名称 |
| product_category | 字符串 | 产品类别 |
| return_reason | 字符串 | 退货原因 |
| customer_description | 字符串 | 客户描述 |
| customer_email | 字符串 | 客户邮箱 |
| customer_phone | 字符串 | 客户电话 |
| status | 字符串 | 退货状态 |
| original_price | 数字 | 原始价格 |
| created_at | 字符串 | 创建时间 |
| updated_at | 字符串 | 更新时间 |

### 状态值

| 状态值 | 描述 |
|-------|------|
| pending | 待处理 |
| processing | 处理中 |
| completed | 已完成 |
| rejected | 已拒绝 |

## 实现示例

以下是使用Express.js实现这些API端点的简单示例：

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// 模拟数据库
const returns = [/* 退货数据 */];
const API_KEY = 'your-api-key';
const JWT_SECRET = 'your-jwt-secret';

// 认证中间件
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '无效的令牌' });
  }
};

// 1. 认证接口
app.post('/api/auth', (req, res) => {
  const { api_key } = req.body;
  if (api_key !== API_KEY) {
    return res.status(401).json({ error: 'API密钥无效' });
  }
  
  const token = jwt.sign({ role: 'api' }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, expires_in: 3600 });
});

// 2. 获取退货列表接口
app.get('/api/returns', authenticate, (req, res) => {
  const { start_date, end_date, status, limit = 100 } = req.query;
  
  // 过滤逻辑...
  
  res.json(returns.slice(0, limit));
});

// 3. 获取退货详情接口
app.get('/api/returns/:id', authenticate, (req, res) => {
  const returnItem = returns.find(r => r.id === req.params.id);
  if (!returnItem) {
    return res.status(404).json({ error: '未找到退货记录' });
  }
  
  res.json(returnItem);
});

// 4. 获取退货图片接口
app.get('/api/returns/:id/images', authenticate, (req, res) => {
  const returnItem = returns.find(r => r.id === req.params.id);
  if (!returnItem) {
    return res.status(404).json({ error: '未找到退货记录' });
  }
  
  res.json({
    return_id: returnItem.id,
    image_urls: returnItem.image_urls || []
  });
});

// 5. 更新退货状态接口
app.put('/api/returns/:id/status', authenticate, (req, res) => {
  const { status, notes } = req.body;
  const returnItem = returns.find(r => r.id === req.params.id);
  if (!returnItem) {
    return res.status(404).json({ error: '未找到退货记录' });
  }
  
  returnItem.status = status;
  if (notes) {
    returnItem.notes = notes;
  }
  
  res.json({
    success: true,
    return_id: returnItem.id,
    status: returnItem.status
  });
});

app.listen(8080, () => {
  console.log('API服务器运行在 http://localhost:8080');
});
```

## 安全建议

1. 使用HTTPS保护API通信
2. 实施速率限制防止滥用
3. 验证所有输入数据
4. 记录所有API调用以便审计
5. 定期轮换API密钥和JWT密钥

## 测试

在实现API后，可以使用以下curl命令进行测试：

```bash
# 1. 获取认证令牌
curl -X POST http://localhost:8080/api/auth \
  -H "Content-Type: application/json" \
  -d '{"api_key": "your-api-key"}'

# 2. 获取退货列表
curl -X GET "http://localhost:8080/api/returns?limit=10" \
  -H "Authorization: Bearer your-jwt-token"

# 3. 获取退货详情
curl -X GET http://localhost:8080/api/returns/RET00001 \
  -H "Authorization: Bearer your-jwt-token"

# 4. 获取退货图片
curl -X GET http://localhost:8080/api/returns/RET00001/images \
  -H "Authorization: Bearer your-jwt-token"

# 5. 更新退货状态
curl -X PUT http://localhost:8080/api/returns/RET00001/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"status": "processed", "notes": "AI分析完成"}'
```

## 联系方式

如有任何问题或需要进一步的帮助，请联系我们的技术支持团队。 
# Gemiturn API 集成文档

本文档详细说明了 Gemiturn 系统的 API 集成方式和工作流程，包括与外部电商平台的交互、数据处理流程以及 AI 分析过程。

## 系统工作流程

整个系统的工作流程如下：

1. **提供 REST API 给电商平台**
   - Gemiturn 系统提供 REST API 接口供各电商平台调用
   - 电商平台可以通过这些 API 提交退货请求和获取分析结果

2. **电商平台调用 API 提交退货请求**
   - 当客户在电商平台上提交退货请求时，电商平台调用 Gemiturn API
   - 请求中包含退货信息、产品信息、客户描述和图片等数据

3. **系统接收数据**
   - Gemiturn 系统接收到这些数据（包括图片、文字描述等）
   - 数据通过 API 接口进入系统并进行初步验证

4. **数据存储在数据库中**
   - 验证后的数据被存储在系统数据库中
   - 主要存储在 `ReturnItem` 表中，关联信息存储在其他相关表中

5. **使用 AI (Gemini + NLP) 分析数据**
   - 系统使用 Google Gemini API 和自然语言处理技术对数据进行分析
   - 分析包括图像识别、文本分析、分类和标签生成

6. **确定最佳处理方式**
   - 基于 AI 分析结果，系统确定最佳的退货处理方式
   - 分析结果和建议存储在数据库中，并可通过 API 返回给电商平台

## API 端点

### 导入 API

#### 批量导入退货请求

```
POST /api/imports/returns
```

**请求参数：**

```json
{
  "start_date": "2023-01-01",  // 可选，开始日期
  "end_date": "2023-12-31",    // 可选，结束日期
  "status": "pending",         // 可选，退货状态
  "limit": 100                 // 可选，返回结果数量限制
}
```

**响应：**

```json
{
  "success": true,
  "imported_count": 15,
  "failed_count": 2,
  "errors": ["导入失败: RET00123 - 图片下载失败"]
}
```

#### 处理单个退货请求

```
POST /api/imports/process
```

**请求参数：**

```json
{
  "return_id": "RET00123"  // 必填，退货 ID
}
```

**响应：**

```json
{
  "success": true,
  "return_id": "RET00123",
  "ai_analysis": {
    "category": "质量问题",
    "reason": "产品损坏",
    "recommendation": "接受退货",
    "confidence": 0.92
  },
  "tags": ["损坏", "电子产品", "屏幕破裂", "保修期内"],
  "suggested_action": "接受退货",
  "confidence": 0.92
}
```

### 退货管理 API

#### 获取退货列表

```
GET /api/returns/
```

#### 创建退货记录

```
POST /api/returns/
```

#### 获取退货详情

```
GET /api/returns/{id}
```

#### 更新退货状态

```
PATCH /api/returns/{id}
```

#### 删除退货记录

```
DELETE /api/returns/{id}
```

## 接口设计

系统使用接口分离的设计模式，确保各组件之间的解耦和灵活性：

### 平台 API 接口 (PlatformAPIInterface)

定义了与外部电商平台交互的方法：

- `authenticate()`: 身份验证
- `get_return_requests()`: 获取退货请求列表
- `get_return_details()`: 获取退货详情
- `get_return_images()`: 获取退货图片
- `update_return_status()`: 更新退货状态
- `download_image()`: 下载图片

### AI 服务接口 (AIServiceInterface)

定义了与 AI 服务交互的方法：

- `analyze_image()`: 分析图像
- `analyze_text()`: 分析文本
- `categorize_return()`: 对退货进行分类
- `generate_tags()`: 生成标签
- `suggest_action()`: 建议处理方式

## 数据库模型

系统使用以下数据库模型存储和管理数据：

### ReturnItem

核心模型，存储退货的所有信息：

- 基本信息（订单ID、产品ID、产品名称）
- 分类信息（产品类别、供应商）
- 客户信息（退货原因、客户描述、联系方式）
- AI分析结果（分类、原因、建议、置信度）
- 状态和财务信息（处理状态、价格、费用）
- 处理信息和时间戳

### ReturnHistory

记录退货项目的状态变更历史：

- 退货项目ID
- 状态变更
- 处理备注
- 操作人员
- 创建时间

### Vendor

存储供应商信息：

- 供应商名称
- 联系信息
- 退货政策
- 退货窗口期

### ProductCategory

存储产品类别信息：

- 类别名称
- 描述
- 父类别
- 默认退货政策

### User

存储用户信息：

- 用户名和密码
- 角色和权限
- 登录信息

## 实现细节

### 导入服务 (ImportService)

负责协调平台 API 和 AI 服务，实现数据导入和处理：

- 从外部平台导入退货数据
- 使用 AI 服务分析图片和文本
- 生成标签和分类
- 将数据保存到数据库

### Gemini 服务 (GeminiService)

使用 Google Gemini API 提供 AI 分析功能：

- 使用 Gemini Pro Vision 模型分析图像
- 使用 Gemini Pro 模型分析文本
- 对退货进行分类并生成标签
- 提供处理建议

## 安全考虑

- 所有 API 端点都需要 JWT 认证
- 敏感操作需要适当的权限
- 数据传输使用 HTTPS 加密
- 密码使用哈希存储
- API 密钥安全存储在环境变量中

## 部署注意事项

- 确保 Google Cloud 凭证正确配置
- 设置适当的环境变量（API 密钥、数据库连接等）
- 配置足够的存储空间用于图片和日志
- 设置适当的日志级别
- 配置数据库备份策略

## 扩展性

系统设计支持以下扩展：

- 接入不同的电商平台（通过实现不同的 `PlatformAPIInterface`）
- 使用不同的 AI 服务（通过实现不同的 `AIServiceInterface`）
- 添加新的分析维度和处理策略
- 扩展数据模型以支持更多业务需求 
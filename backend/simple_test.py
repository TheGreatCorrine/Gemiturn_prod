import os
import google.generativeai as genai
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 获取并打印 API 密钥信息（只显示前几个字符）
api_key = os.getenv('GEMINI_API_KEY')
print(f"API 密钥前缀: {api_key[:15]}...")

# 配置 API
genai.configure(api_key=api_key)

try:
    # 尝试列出所有可用模型
    print("\n可用模型列表：")
    models = genai.list_models()
    for model in models:
        print(f"- {model.name}")
except Exception as e:
    print(f"\n获取模型列表时出错：{str(e)}") 
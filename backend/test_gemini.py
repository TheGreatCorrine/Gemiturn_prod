import os
from dotenv import load_dotenv
import google.generativeai as genai

def test_gemini_api():
    # 加载环境变量
    load_dotenv()
    
    # 获取 API 密钥
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("错误：未找到 GEMINI_API_KEY 环境变量")
        return False
    
    print(f"API 密钥长度: {len(api_key)} 字符")
    print(f"API 密钥前缀: {api_key[:10]}...")  # 只显示前10个字符
    
    try:
        # 配置 Gemini
        genai.configure(api_key=api_key)
        
        # 获取模型
        print("\n尝试加载 Gemini Pro 模型...")
        model = genai.GenerativeModel('gemini-1.5-pro')  # 使用最新的模型名称
        
        # 测试简单的问题
        print("发送测试问题...")
        response = model.generate_content("你好，请用中文回答：1+1等于几？")
        
        # 打印响应
        print("\nAPI 测试结果：")
        print("-" * 40)
        print(response.text)
        print("-" * 40)
        
        return True
    except Exception as e:
        print(f"\n错误详情：{str(e)}")
        return False

if __name__ == "__main__":
    print("开始测试 Gemini API...")
    success = test_gemini_api()
    if success:
        print("\n✅ API 测试成功！")
    else:
        print("\n❌ API 测试失败！请检查：")
        print("1. API 密钥是否正确（应该以 'AI' 开头）")
        print("2. 网络连接是否正常")
        print("3. API 配额是否充足")
        print("4. 是否在 Google Cloud Console 中启用了 Gemini API") 
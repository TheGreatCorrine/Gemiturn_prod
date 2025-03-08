import os
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image

# 定义不同类型的 prompts
PROMPT_TEMPLATES = {
    '1': "简短描述这张图片的主要内容，用中文回答。",
    '2': """请详细分析这张图片，包括：
1. 主要人物或物体
2. 场景环境
3. 颜色和光线
4. 情绪氛围
请用中文回答。""",
    '3': """作为一个专业摄影师，请分析这张照片的：
1. 构图技巧
2. 光线运用
3. 拍摄角度
4. 改进建议
请用中文回答。""",
    '4': """请从商业角度分析这张图片：
1. 图片可能的使用场景
2. 目标受众
3. 传达的信息
4. 营销价值
请用中文回答。""",
    '5': """请识别并描述图片中的：
1. 人物表情和情绪
2. 肢体语言
3. 穿着特征
4. 互动方式
请用中文回答。"""
}

def test_vision_api(image_path, prompt_type='1'):
    # 加载环境变量
    load_dotenv()
    
    # 获取 API 密钥
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("错误：未找到 GEMINI_API_KEY 环境变量")
        return False
    
    try:
        # 配置 Gemini
        genai.configure(api_key=api_key)
        
        # 加载图像
        print(f"\n正在加载图像: {image_path}")
        image = Image.open(image_path)
        
        # 获取视觉模型（使用更快的 flash 模型）
        print("正在初始化 Gemini Flash Vision 模型...")
        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        
        # 获取选择的 prompt
        prompt = PROMPT_TEMPLATES.get(prompt_type, PROMPT_TEMPLATES['1'])
        print(f"\n使用的 Prompt：\n{prompt}")
        
        # 分析图像
        print("\n正在分析图像...")
        response = model.generate_content([prompt, image])
        
        # 打印响应
        print("\n图像分析结果：")
        print("-" * 50)
        print(response.text)
        print("-" * 50)
        
        return True
        
    except Exception as e:
        print(f"\n错误详情：{str(e)}")
        return False

def print_prompt_menu():
    print("\n请选择分析类型：")
    print("1. 简短描述（最快）")
    print("2. 详细分析")
    print("3. 摄影技术分析")
    print("4. 商业价值分析")
    print("5. 人物特征分析")
    return input("请输入数字(1-5)，默认为1：").strip() or '1'

if __name__ == "__main__":
    print("开始测试 Gemini Vision API...")
    
    # 直接使用测试图片
    image_path = "test_images/WechatIMG1435.jpeg"
    
    if not os.path.exists(image_path):
        print(f"错误：找不到图片文件 '{image_path}'")
    else:
        prompt_type = print_prompt_menu()
        success = test_vision_api(image_path, prompt_type)
        if success:
            print("\n✅ 图像分析成功！")
        else:
            print("\n❌ 图像分析失败！") 
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai
import os
from PIL import Image
import io
import base64

app = Flask(__name__)

# 加载环境变量
load_dotenv()

# 配置 Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# 创建模型实例
model = genai.GenerativeModel('gemini-2.0-flash-lite')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # 获取上传的图片
        image_file = request.files['image']
        if not image_file:
            return jsonify({'error': '没有上传图片'}), 400
        
        # 读取图片
        image = Image.open(image_file)
        
        # 获取分析类型
        analysis_type = request.form.get('type', 'return')
        
        # 根据分析类型选择 prompt
        if analysis_type == 'return':
            prompt = """作为退货分析专家，请分析这张图片并提供以下信息：
1. 退货原因分类（参考以下类别）：
   - 质量问题
   - 尺寸不合适
   - 外观差异
   - 性能不达标
   - 收到错误商品
   - 物流问题
   - 客户改变主意
   - 配件缺失
   - 过敏/不良反应
   - 延迟交付

2. 建议处理方式（参考以下方法）：
   - 直接转售
   - 折价销售
   - 退回供应商
   - 维修后销售
   - 零件回收
   - 慈善捐赠
   - 环保处理
   - 跨平台直接销售
   - 打包销售
   - 转为样品/展示品

请详细说明分类理由和处理建议。"""
        else:
            prompt = "请简要描述这张图片的主要内容，用中文回答。"
        
        # 分析图片
        response = model.generate_content([prompt, image])
        
        return jsonify({
            'success': True,
            'result': response.text
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 
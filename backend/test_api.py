import requests
from PIL import Image
import io
import json

def test_image_analysis():
    # 图片路径
    image_path = "test_images/WechatIMG1435.jpeg"
    
    # 读取图片
    with open(image_path, 'rb') as f:
        image_data = f.read()
    
    # 准备请求数据
    files = {
        'image': ('image.jpg', image_data, 'image/jpeg')
    }
    
    product_info = {
        'name': '测试商品',
        'category': '电子产品',
        'price': '999.00'
    }
    
    data = {
        'description': '客户反馈商品有问题',
        'product_info': json.dumps(product_info)  # 将字典转换为 JSON 字符串
    }
    
    # 发送请求
    try:
        response = requests.post(
            'http://localhost:5001/api/analyze',
            files=files,
            data=data
        )
        
        # 打印结果
        print("\n分析结果：")
        print("-" * 50)
        if response.status_code == 200:
            result = response.json()
            print(f"状态：成功")
            print(f"分析：\n{result.get('analysis', '')}")
            if 'text_analysis' in result:
                print(f"\n文本分析：\n{result['text_analysis']}")
            if 'tags' in result:
                print(f"\n标签：\n{', '.join(result['tags'])}")
        else:
            print(f"状态：失败 ({response.status_code})")
            print(f"错误：{response.text}")
        print("-" * 50)
        
    except Exception as e:
        print(f"请求失败：{str(e)}")

if __name__ == "__main__":
    print("开始测试图像分析 API...")
    test_image_analysis() 
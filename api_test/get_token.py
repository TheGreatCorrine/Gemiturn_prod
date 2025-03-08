import requests
import json

# 登录获取令牌
login_url = "http://localhost:5002/api/auth/login"
login_data = {
    "username": "admin",
    "password": "admin123"
}

print("正在登录...")
login_response = requests.post(login_url, json=login_data)
if login_response.status_code != 200:
    print(f"登录失败: {login_response.status_code}")
    print(login_response.text)
    exit(1)

token = login_response.json().get("access_token")
if not token:
    print("登录响应中没有令牌")
    print(login_response.json())
    exit(1)

print(f"登录成功，获取到令牌: {token}") 
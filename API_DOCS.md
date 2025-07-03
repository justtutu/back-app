# 用户认证API文档

## 基础信息
- 基础URL: `http://localhost:3000`
- 认证方式: Bearer Token
- 响应格式: JSON

## 统一响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    "msg": "操作成功",
    "result": "数据内容"
  }
}
```

### 失败响应
```json
{
  "success": false,
  "data": {
    "msg": "错误信息",
    "result": null
  }
}
```

## 用户认证接口

### 1. 用户注册
- **接口**: `POST /user/register`
- **描述**: 用户注册接口
- **请求体**:
```json
{
  "username": "testuser",
  "password": "123456",
  "phone": "13800138000",
  "avatar": "https://example.com/avatar.jpg"
}
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "msg": "注册成功",
    "id": "user-uuid"
  }
}
```

### 2. 用户登录
- **接口**: `POST /user/login`
- **描述**: 用户登录接口，返回token和用户信息
- **请求体**:
```json
{
  "username": "testuser",
  "password": "123456"
}
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "msg": "登录成功",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": "user-uuid",
      "username": "testuser",
      "phone": "13800138000",
      "avatar": "https://example.com/avatar.jpg",
      "role": "user",
      "points": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. 获取当前用户信息
- **接口**: `GET /user/profile/me`
- **描述**: 获取当前登录用户信息
- **认证**: 需要Bearer Token
- **请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "msg": "获取用户信息成功",
    "id": "user-uuid",
    "username": "testuser",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "role": "user",
    "points": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. 退出登录
- **接口**: `POST /user/logout`
- **描述**: 用户退出登录
- **认证**: 需要Bearer Token
- **请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "msg": "退出登录成功"
  }
}
```

## 微信小程序集成说明

### Token存储
登录成功后，将返回的token存储到微信小程序的本地存储中：
```javascript
// 存储token
wx.setStorageSync('token', response.data.token);

// 获取token
const token = wx.getStorageSync('token');
```

### 请求拦截器
在微信小程序中设置请求拦截器，自动添加token：
```javascript
// 在请求拦截器中添加token
const token = wx.getStorageSync('token');
if (token) {
  header.Authorization = `Bearer ${token}`;
}
```

### 错误处理
当收到401错误时，清除本地token并跳转到登录页面：
```javascript
if (response.statusCode === 401) {
  wx.removeStorageSync('token');
  wx.navigateTo({
    url: '/pages/login/login'
  });
}
```

### 响应处理
在微信小程序中处理响应数据：
```javascript
// 处理成功响应
if (response.data.success) {
  const { msg, ...data } = response.data.data;
  // 显示成功消息
  wx.showToast({
    title: msg,
    icon: 'success'
  });
  // 处理数据
  console.log(data);
} else {
  // 处理失败响应
  const { msg } = response.data.data;
  wx.showToast({
    title: msg,
    icon: 'error'
  });
}
```

## 数据库字段说明

### User表字段
- `id`: 用户唯一标识（UUID）
- `username`: 用户名
- `password`: 加密后的密码
- `phone`: 手机号
- `avatar`: 头像URL
- `role`: 用户角色（默认：user）
- `points`: 积分（默认：0）
- `token`: 当前登录token
- `tokenExpiresAt`: token过期时间
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

## 安全说明
1. 密码使用bcrypt加密存储
2. JWT token有效期为7天
3. 支持token自动过期机制
4. 退出登录时清除服务器端token 
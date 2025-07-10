<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description
测试

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```



## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## 接口文档

### 通用接口

#### 1. 获取欢迎信息
- 路径：`GET /`
- 描述：返回欢迎信息。
- 请求参数：无
- 返回示例：
  ```json
  "Hello World!"
  ```

---

### 用户相关接口

#### 2. 创建用户
- 路径：`POST /user`
- 描述：创建新用户。
- 请求参数：
  | 字段     | 类型   | 必填 | 说明     |
  |----------|--------|------|----------|
  | username | string | 是   | 用户名    |
  | password | string | 是   | 密码      |
  | phone    | string | 是   | 手机号    |
  | avatar   | string | 否   | 头像      |
- 返回：用户对象

#### 3. 查询所有用户
- 路径：`GET /user`
- 描述：获取所有用户列表。
- 请求参数：无
- 返回：用户对象数组

#### 4. 根据ID查询用户
- 路径：`GET /user/:id`
- 描述：根据ID获取用户信息。
- 请求参数：
  - id: 用户ID（路径参数）
- 返回：用户对象

#### 5. 更新用户
- 路径：`PUT /user/:id`
- 描述：根据ID更新用户信息。
- 请求参数：
  - id: 用户ID（路径参数）
  - body:
    | 字段     | 类型   | 必填 | 说明     |
    |----------|--------|------|----------|
    | username | string | 否   | 用户名    |
    | password | string | 否   | 密码      |
    | phone    | string | 否   | 手机号    |
    | avatar   | string | 否   | 头像      |
    | role     | string | 否   | 角色      |
- 返回：更新后的用户对象

#### 6. 删除用户
- 路径：`DELETE /user/:id`
- 描述：根据ID删除用户。
- 请求参数：
  - id: 用户ID（路径参数）
- 返回：无内容

#### 7. 用户注册
- 路径：`POST /user/register`
- 描述：注册新用户，用户名或手机号已存在时会报错。
- 请求参数：
  | 字段     | 类型   | 必填 | 说明     |
  |----------|--------|------|----------|
  | username | string | 是   | 用户名    |
  | password | string | 是   | 密码      |
  | phone    | string | 是   | 手机号    |
  | avatar   | string | 否   | 头像      |
- 返回：
  ```json
  { "id": "用户ID" }
  ```

---

### 用户对象结构
| 字段     | 类型   | 说明     |
|----------|--------|----------|
| id       | string | 用户ID   |
| username | string | 用户名   |
| password | string | 密码     |
| phone    | string | 手机号   |
| avatar   | string | 头像     |
| role     | string | 角色     |
| points   | number | 积分     |

# 用户认证API

基于NestJS框架开发的用户认证系统，支持用户注册、登录、token验证等功能，专为微信小程序设计。

## 功能特性

- ✅ 用户注册
- ✅ 用户登录（返回JWT token）
- ✅ 获取当前用户信息
- ✅ 退出登录
- ✅ JWT token认证
- ✅ 密码加密存储
- ✅ 统一响应格式
- ✅ 微信小程序友好

## 技术栈

- **框架**: NestJS
- **数据库**: MySQL + TypeORM
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcryptjs
- **验证**: class-validator

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或者使用 pnpm
pnpm install
```

### 2. 配置数据库

确保你的MySQL数据库已经启动，并更新 `src/app.module.ts` 中的数据库配置：

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'your_username',
  password: 'your_password',
  database: 'your_database',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true, // 开发环境使用，生产环境请设置为false
})
```

### 3. 启动应用

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run start:prod
```

应用将在 `http://localhost:3000` 启动。

## API接口

### 用户注册
```http
POST /user/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456",
  "phone": "13800138000",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 用户登录
```http
POST /user/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

### 获取用户信息
```http
GET /user/profile/me
Authorization: Bearer YOUR_TOKEN_HERE
```

### 退出登录
```http
POST /user/logout
Authorization: Bearer YOUR_TOKEN_HERE
```

## 响应格式

所有API都使用统一的响应格式：

### 成功响应
```json
{
  "success": true,
  "data": {
    "msg": "操作成功",
    "data": "数据内容"
  }
}
```

### 失败响应
```json
{
  "success": false,
  "data": {
    "msg": "错误信息",
    "data": null
  }
}
```

## 微信小程序集成

### 1. 存储Token
```javascript
// 登录成功后存储token
wx.setStorageSync('token', response.data.token);
```

### 2. 请求拦截器
```javascript
// 在请求拦截器中自动添加token
const token = wx.getStorageSync('token');
if (token) {
  header.Authorization = `Bearer ${token}`;
}
```

### 3. 响应处理
```javascript
// 处理API响应
if (response.data.success) {
  const { msg, ...data } = response.data.data;
  wx.showToast({
    title: msg,
    icon: 'success'
  });
  // 处理数据
} else {
  const { msg } = response.data.data;
  wx.showToast({
    title: msg,
    icon: 'error'
  });
}
```

## 测试

使用提供的 `test-api.http` 文件在VS Code中测试API接口，或者使用Postman等工具。

## 安全说明

1. **密码加密**: 使用bcryptjs进行密码加密
2. **JWT Token**: 有效期为7天
3. **Token过期**: 支持自动过期机制
4. **退出登录**: 清除服务器端token

## 开发说明

### 项目结构
```
src/
├── common/           # 公共模块
│   ├── config/      # 配置文件
│   ├── decorators/  # 装饰器
│   ├── guards/      # 守卫
│   ├── services/    # 服务
│   └── utils/       # 工具类
├── user/            # 用户模块
│   ├── dto/         # 数据传输对象
│   ├── user.controller.ts
│   ├── user.entity.ts
│   ├── user.service.ts
│   └── user.module.ts
└── app.module.ts    # 主模块
```

### 添加新接口

1. 在对应的DTO中添加验证规则
2. 在Service中实现业务逻辑
3. 在Controller中添加路由
4. 使用ResponseUtil统一响应格式

## 后端部署步骤（CentOS环境）

### 1. 服务器准备

- 推荐将项目代码放在 `/home/back-app` 目录。
- 确保服务器已开放 3000 端口（或你自定义的端口）。

### 2. 安装 Node.js、pnpm、Git（如不使用 Docker 可选）

```bash
# 安装 Node.js（推荐用 nvm 管理）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 安装 pnpm
npm install -g pnpm

# 安装 Git
sudo yum install git -y
```

### 3. 拉取或上传项目代码

- 推荐用 git clone 拉取：

```bash
cd /opt
sudo git clone <你的仓库地址> back-app
cd back-app
```

- 或用 scp/Xftp/WinSCP 上传本地代码。

### 4. 安装依赖并构建

```bash
pnpm install
pnpm run build
```


---

## Docker环境安装与部署

### 1. 安装 Docker（CentOS）

```bash
sudo yum remove docker \
                docker-client \
                docker-client-latest \
                docker-common \
                docker-latest \
                docker-latest-logrotate \
                docker-logrotate \
                docker-engine
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
# 验证安装
docker --version
```

### 2. 编写 Dockerfile

在 `back-app` 目录下新建 `Dockerfile`：

```dockerfile
FROM node:18
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 3. 编写 .dockerignore（推荐）

```
node_modules
dist
.git
.idea
.history
test
*.log
```

### 4. 构建镜像

```bash
docker build -t back-app .
```

### 5. 服务器准备 .env 文件

- 在 `/home/back-app` 目录下手动创建 `.env` 文件（不要 COPY 进镜像）：

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=yourpassword
DB_NAME=yourdb
```

### 6. 运行容器

```bash
docker run -d --name back-app -p 3000:3000 --env-file .env back-app
```

### 7. 常用命令

- 查看日志：`docker logs -f back-app`
- 重启容器：`docker restart back-app`
- 停止容器：`docker stop back-app`
- 删除容器：`docker rm -f back-app`
- 查看所有容器：`docker ps -a`

---

## 许可证

MIT License

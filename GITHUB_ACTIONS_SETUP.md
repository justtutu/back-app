# GitHub Actions 自动化部署配置指南

## 概述

本项目已配置 GitHub Actions 实现自动化部署。当你推送代码到 `main` 或 `master` 分支时，会自动触发测试和部署流程。

## 工作流程

### 1. 测试阶段 (Test Job)
- 检出代码
- 设置 Node.js 18 环境
- 安装 pnpm 和依赖
- 运行测试用例

### 2. 部署阶段 (Deploy Job)
- 仅在 `main/master` 分支触发
- 构建项目
- 连接服务器执行部署脚本
- 自动重启 Docker 容器

## 配置步骤

### 1. 在 GitHub 仓库中设置 Secrets

进入你的 GitHub 仓库 → `Settings` → `Secrets and variables` → `Actions`，添加以下 secrets：

| Secret 名称 | 说明 | 示例值 |
|-------------|------|--------|
| `SERVER_HOST` | 服务器 IP 地址 | `192.168.1.100` |
| `SERVER_USER` | SSH 用户名 | `root` |
| `SERVER_SSH_KEY` | SSH 私钥内容 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_PORT` | SSH 端口（可选） | `22` |

### 2. 生成 SSH 密钥（如果还没有）

在本地生成 SSH 密钥对：

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

### 3. 将公钥添加到服务器

```bash
# 复制公钥内容
cat ~/.ssh/id_rsa.pub

# 在服务器上添加到 authorized_keys
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 4. 将私钥添加到 GitHub Secrets

复制私钥内容：
```bash
cat ~/.ssh/id_rsa
```

将完整内容（包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`）添加到 `SERVER_SSH_KEY` secret。

## 使用方法

### 自动部署
1. 推送代码到 `main` 或 `master` 分支
2. GitHub Actions 自动触发部署
3. 在 `Actions` 标签页查看部署进度

### 手动部署
在服务器上执行：
```bash
cd /home/back-app
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 文件说明

- `.github/workflows/deploy.yml` - GitHub Actions 配置文件
- `scripts/deploy.sh` - 手动部署脚本
- `dockerfile` - Docker 镜像构建文件
- `.env` - 环境变量文件（需要在服务器上创建）

## 环境变量配置

在服务器的 `/home/back-app/.env` 文件中配置：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=yourpassword
DB_NAME=yourdb
JWT_SECRET=your_jwt_secret
```

## 故障排除

### 1. SSH 连接失败
- 检查 `SERVER_HOST` 和 `SERVER_USER` 是否正确
- 确认 SSH 密钥已正确配置
- 检查服务器防火墙设置

### 2. 部署失败
- 查看 GitHub Actions 日志
- 检查服务器上的 Docker 状态
- 确认 `.env` 文件存在且配置正确

### 3. 容器启动失败
```bash
# 查看容器日志
docker logs back-app

# 检查容器状态
docker ps -a

# 重启容器
docker restart back-app
```

## 安全建议

1. **使用专用用户**：不要使用 root 用户，创建专门的部署用户
2. **限制 SSH 访问**：只允许密钥认证，禁用密码登录
3. **定期更新密钥**：定期更换 SSH 密钥
4. **监控日志**：定期检查部署日志和服务器状态

## 扩展功能

### 1. 添加通知
可以在部署完成后发送通知到 Slack、钉钉等平台。

### 2. 多环境部署
可以配置不同分支部署到不同环境（开发、测试、生产）。

### 3. 回滚功能
可以添加回滚到上一个版本的脚本。

## 联系支持

如果遇到问题，请：
1. 查看 GitHub Actions 日志
2. 检查服务器状态
3. 查看本文档的故障排除部分 
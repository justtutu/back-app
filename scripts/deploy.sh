#!/bin/bash

# 部署脚本 - 手动执行版本
# 使用方法: ./scripts/deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署后端应用..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录执行此脚本"
    exit 1
fi

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ 错误: Docker 未运行，请先启动 Docker"
    exit 1
fi

# 备份当前代码
echo "📦 备份当前代码..."
if [ -d ".git" ]; then
    git stash
fi

# 拉取最新代码
echo "⬇️  拉取最新代码..."
git pull origin main

# 停止并删除旧容器
echo "🛑 停止旧容器..."
docker stop back-app 2>/dev/null || true
docker rm back-app 2>/dev/null || true

# 清理旧镜像（可选）
echo "🧹 清理旧镜像..."
docker image prune -f 2>/dev/null || true

# 构建新镜像
echo "🔨 构建新镜像..."
docker build -t back-app .

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在，请确保环境变量已正确配置"
fi

# 启动新容器
echo "🚀 启动新容器..."
docker run -d \
    --name back-app \
    -p 3000:3000 \
    --env-file .env \
    --restart unless-stopped \
    back-app

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查容器状态
echo "🔍 检查容器状态..."
if docker ps | grep -q back-app; then
    echo "✅ 容器启动成功！"
else
    echo "❌ 容器启动失败！"
    echo "查看容器日志:"
    docker logs back-app
    exit 1
fi

# 查看日志
echo "📋 查看最新日志..."
docker logs --tail 20 back-app

# 健康检查
echo "🏥 执行健康检查..."
sleep 5
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ 健康检查通过！服务正常运行"
else
    echo "⚠️  健康检查失败，请检查服务状态"
fi

echo "🎉 部署完成！"
echo "📊 容器信息:"
docker ps | grep back-app 
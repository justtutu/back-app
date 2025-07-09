# 使用官方 Node 18 镜像
FROM node:18

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 复制项目所有文件
COPY . .

# 构建项目
RUN pnpm run build

# 暴露端口（如有需要可改为其它端口）
EXPOSE 3000

# 启动服务
CMD ["node", "dist/main.js"]
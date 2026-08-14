---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: 'da98ef12-8629-499e-8ae9-e8e7b2305baa'
  PropagateID: 'da98ef12-8629-499e-8ae9-e8e7b2305baa'
  ReservedCode1: '7185e8d2-f66a-4470-a8fd-5b9f973fa214'
  ReservedCode2: '7185e8d2-f66a-4470-a8fd-5b9f973fa214'
---

# ClipDrop

跨设备剪贴板——手机电脑之间即时传输文字和图片。

## 功能

- 文字输入，Enter 发送（Shift+Enter 换行）
- Ctrl+V 粘贴截图 / 拖拽图片 / 选择文件上传
- 图片自动压缩（1200px + JPEG 0.6），传输秒级
- SSE 实时推送，1秒内跨设备同步
- 点击文字即可复制，点击图片可放大查看
- 长按/右键弹出操作菜单（复制、删除）
- 消息 7 天自动过期，超过 200 条自动清理旧记录

## 部署（Cloudflare Pages）

1. 创建 KV 命名空间

```bash
npx wrangler kv namespace create "CLIPDROP_KV"
```

2. 将返回的 `id` 填入 `wrangler.toml`

3. 推送到 GitHub

4. Cloudflare Pages → 创建 → 连接 Git → 选 clipdrop 仓库
   - 构建配置留空
   - 根目录：`.`

5. 绑定 KV：Pages 项目 → Settings → Functions → KV namespace bindings
   - Variable name: `CLIPDROP_KV`
   - 选择刚创建的 KV

6. 重新部署生效

## 技术栈

- 前端：纯 HTML/CSS/JS，无框架，响应式
- 后端：Cloudflare Pages Functions（Serverless）
- 存储：Cloudflare KV
- 实时通信：SSE（Server-Sent Events）

> AI生成
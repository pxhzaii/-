---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '1ca26fb2-8322-48c7-82ad-6b9e817e7fd1'
  PropagateID: '1ca26fb2-8322-48c7-82ad-6b9e817e7fd1'
  ReservedCode1: '092b8a44-42e2-42e4-97d8-968dfefda38b'
  ReservedCode2: '092b8a44-42e2-42e4-97d8-968dfefda38b'
---

# ClipDrop

跨设备剪贴板——手机电脑之间即时传输文字和图片。

## 功能

- 文字输入，Enter 发送（Shift+Enter 换行）
- Ctrl+V 粘贴截图 / 拖拽图片 / 选择文件上传
- 图片自动压缩（1200px + JPEG 0.6），传输秒级
- 1.5 秒轮询同步，跨设备近乎实时
- 点击文字即可复制，点击图片可放大查看
- 长按/右键弹出操作菜单（复制、删除）
- 任意设备点击「清空」即可清空全部消息
- 自动清理：超过 200 条自动删除最旧记录

## 部署（Cloudflare Pages + D1）

1. 创建 D1 数据库

```bash
npx wrangler d1 create clipdrop-db
```

2. 将返回的 `database_id` 填入 `wrangler.toml`

3. 在 D1 控制台执行建表 SQL

```sql
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  ts INTEGER NOT NULL
);
```

4. 推送到 GitHub

5. Cloudflare Pages → 创建 → 连接 Git → 选 clipdrop 仓库
   - 构建配置留空
   - 根目录：`.`

6. 绑定 D1：Pages 项目 → Settings → Bindings → Add → D1 Database
   - Variable name: `DB`
   - 选择刚创建的 `clipdrop-db`

7. 重新部署生效

## 技术栈

- 前端：纯 HTML/CSS/JS，无框架，响应式
- 后端：Cloudflare Pages Functions（Serverless）
- 存储：Cloudflare D1（SQLite，强一致）
- 同步：1.5 秒轮询

> AI生成
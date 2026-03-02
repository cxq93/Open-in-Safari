# Open in Safari 扩展程序手动安装指南

本指南将帮助你在 macOS 上手动完成 Edge/Chrome 扩展程序与本地 Safari 启动脚本的对接。由于浏览器安全限制，必须严格执行以下步骤。

### **第一阶段：加载浏览器扩展**

1. 打开 Microsoft Edge 浏览器，访问 `edge://extensions/`（如果是 Chrome 请访问 `chrome://extensions/`）。
2. 在页面左侧或右上角开启 **“开发人员模式”**。
3. 点击 **“加载解压后的扩展”**，选择包含 `manifest.json` 和 `background.js` 的文件夹。
4. **关键步骤**：安装完成后，在扩展卡片上找到一串由 32 位字符组成的 **“ID”**（例如：`abcdefg...`）。请记录下来，后续配置需要使用。

---

### **第二阶段：准备本地宿主环境**

1. **保存 Python 脚本**：
   将 `open_safari_host.py` 移动到一个永久存放的目录，例如：`/Users/你的用户名/scripts/open_safari_host.py`。
2. **赋予执行权限**：
   打开终端（Terminal），执行以下命令（请替换为你的实际路径）：
   ```bash
   chmod +x /Users/你的用户名/scripts/open_safari_host.py
   ```
3. **确认 Python 路径**：
   在终端输入 `which python3`，确认输出路径。如果输出不是 `/usr/bin/python3`，请修改脚本首行的 Shebang。

---

### **第三阶段：配置并注册宿主清单**

1. **编辑 JSON 配置文件**：
   打开 `com.tabbit.open_in_safari.json`，修改以下两个核心字段：
   - `"path"`: 必须填写 `open_safari_host.py` 的**绝对路径**（严禁使用 `~` 缩写）。
   - `"allowed_origins"`: 将其中的 ID 替换为你第一阶段记录的 **扩展 ID**。格式为 `chrome-extension://你的ID/`。

2. **放置配置文件**：
   将修改好的 `com.tabbit.open_in_safari.json` 文件移动到以下系统目录：
   
   - **Microsoft Edge 路径**：
     `~/Library/Application Support/Microsoft Edge/NativeMessagingHosts/`
   
   - **Google Chrome 路径**：
     `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/`

   *注：如果对应的文件夹不存在，请手动创建它们。*

---

### **第四阶段：测试与调试**

1. 点击浏览器工具栏中的“Open in Safari”图标。
2. 如果 Safari 成功弹出并加载当前页面，则部署成功。
3. **常见问题排查**：
   - **报错 "Native host not found"**：检查 JSON 文件名是否与 `background.js` 中调用的名称一致，检查 JSON 是否放在了正确的 `NativeMessagingHosts` 文件夹下。
   - **点击无反应**：检查 JSON 里的 `path` 是否为绝对路径，且 Python 脚本是否有执行权限。
   - **权限错误**：检查 JSON 里的 `allowed_origins` 是否准确包含了当前的扩展 ID。
```

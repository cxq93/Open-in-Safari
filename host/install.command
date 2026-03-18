#!/usr/bin/env bash

# === Open in Safari 扩展本地主机一键安装脚本 (macOS) ===
echo "======================================"
echo "    Open in Safari 本地安装程序"
echo "======================================"
echo ""

# 1. 获取当前脚本所在的绝对路径
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HOST_SCRIPT="$DIR/open_safari_host.py"
JSON_MANIFEST="$DIR/com.tabbit.open_in_safari.json"

if [ ! -f "$HOST_SCRIPT" ]; then
    echo "❌ 错误：找不到本地脚本 '$HOST_SCRIPT' ! 请确保您没有移动安装包内的文件。"
    exit 1
fi

if [ ! -f "$JSON_MANIFEST" ]; then
    echo "❌ 错误：找不到清单文件 '$JSON_MANIFEST' ! 请确保您没有移动安装包内的文件。"
    exit 1
fi

# 2. 赋予 Python 脚本可执行权限
echo "[1/4] 赋予本地脚本可执行权限..."
chmod +x "$HOST_SCRIPT"

# 3. 动态更新 JSON 中的绝对路径 (适配 macOS/Linux sed 语法)
echo "[2/4] 更新配置清单里的脚本执行路径..."
sed -i '' "s|\"path\": \".*\"|\"path\": \"$HOST_SCRIPT\"|g" "$JSON_MANIFEST"

# 4. 获取用户输入的 扩展 ID (由于必须自己加载解压，ID 可能改变，除非指定了 key)
echo ""
echo "[3/4] 请输入浏览器为您生成的“扩展 ID” (例如: abcdefgh...):"
read -p "ID： " EXT_ID

if [ -z "$EXT_ID" ]; then
    echo "❌ 错误：必须输入扩展 ID。"
    exit 1
fi

# 5. 更新 allowed_origins
echo "[4/4] 将扩展 ID 写入配置清单..."
sed -i '' "s|\"chrome-extension://.*\"|\"chrome-extension://$EXT_ID/\"|g" "$JSON_MANIFEST"

# 6. 复制 JSON 清单到对应的浏览器 NativeMessagingHosts 目录
echo ""
echo "正在将配置安装到浏览器..."

CHROMIUM_DIRS=(
    "$HOME/Library/Application Support/Microsoft Edge/NativeMessagingHosts"
    "$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
)

INSTALLED=0

for NM_DIR in "${CHROMIUM_DIRS[@]}"; do
    # 取巧判断：如果浏览器 Application Support 目录存在，就尝试建 NativeMessagingHosts 并复制
    PARENT_DIR="$(dirname "$NM_DIR")"
    if [ -d "$PARENT_DIR" ]; then
        mkdir -p "$NM_DIR"
        cp "$JSON_MANIFEST" "$NM_DIR/"
        echo "✅ 成功部署到: $NM_DIR"
        INSTALLED=1
    fi
done

if [ "$INSTALLED" -eq 1 ]; then
    echo ""
    echo "🎉 安装完成！请保留 '$DIR' 文件夹（这是您的本地主机运行环境）。"
    echo "现在您可以前往浏览器测试 'Open in Safari' 插件了。"
else
    echo ""
    echo "⚠️ 警告：似乎没有在您的 Mac 上检测到常见的 Chromium 浏览器（Edge, Chrome, Arc 等）。"
    echo "您可能需要手动将 '$JSON_MANIFEST' 复制到您浏览器的 NativeMessagingHosts 目录下。"
fi

echo ""
echo "=== 按任意键退出 ==="
read -n 1 -s -r

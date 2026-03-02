#!/usr/bin/env python3
import sys
import json
import struct
import subprocess

# 读取来自浏览器扩展的消息
def get_message():
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        sys.exit(0)
    message_length = struct.unpack('@I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

# 向浏览器扩展发送响应
def send_message(message_content):
    content = json.dumps(message_content).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('@I', len(content)))
    sys.stdout.buffer.write(content)
    sys.stdout.buffer.flush()

if __name__ == '__main__':
    try:
        msg = get_message()
        url = msg.get('url')
        if url:
            # 执行 macOS 命令在 Safari 中打开 URL
            subprocess.run(["open", "-a", "Safari", url])
            send_message({"status": "success", "url": url})
    except Exception as e:
        send_message({"status": "error", "error": str(e)})

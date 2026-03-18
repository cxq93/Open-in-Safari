#!/usr/bin/python3
import sys
import json
import struct
import subprocess
import re

# 读取固定长度字节的辅助函数，防止读取不完整
def read_bytes(count):
    bytes_read = 0
    buffer = b''
    while bytes_read < count:
        chunk = sys.stdin.buffer.read(count - bytes_read)
        if not chunk:
            break
        buffer += chunk
        bytes_read += len(chunk)
    return buffer

# 读取来自浏览器扩展的消息
def get_message():
    raw_length = read_bytes(4)
    if len(raw_length) != 4:
        sys.exit(0)
    message_length = struct.unpack('=I', raw_length)[0]
    message_data = read_bytes(message_length)
    if len(message_data) != message_length:
        sys.exit(0)
    message = message_data.decode('utf-8')
    return json.loads(message)

# 向浏览器扩展发送响应
def send_message(message_content):
    content = json.dumps(message_content).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('=I', len(content)))
    sys.stdout.buffer.write(content)
    sys.stdout.buffer.flush()

if __name__ == '__main__':
    try:
        msg = get_message()
        url = msg.get('url')

        if url and re.match(r'^https?://[^\s/$.?#].[^\s]*$', url, re.IGNORECASE):
            subprocess.run(
                ["/usr/bin/open", "-a", "Safari", url],
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            send_message({"status": "success", "url": url})
        else:
            send_message({"status": "error", "error": "Invalid or unsafe URL protocol"})
    except Exception as e:
        send_message({"status": "error", "error": str(e)})

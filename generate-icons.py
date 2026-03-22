#!/usr/bin/env python3
"""
生成 PWA 和 Android 应用图标
使用纯 Python 生成简单的红底白点图标（无需第三方库）
"""

import struct
import zlib
import os

def create_png(width, height, pixels):
    """创建 PNG 文件的字节数据"""
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = chunk(b'IHDR', ihdr_data)
    
    # IDAT - raw pixel data with filter bytes
    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter: none
        for x in range(width):
            idx = (y * width + x) * 3
            raw += bytes(pixels[idx:idx+3])
    
    compressed = zlib.compress(raw)
    idat = chunk(b'IDAT', compressed)
    
    # IEND
    iend = chunk(b'IEND', b'')
    
    return signature + ihdr + idat + iend

def draw_circle(pixels, width, cx, cy, r, color):
    """在像素数组上画填充圆"""
    for y in range(max(0, cy - r), min(width, cy + r + 1)):
        for x in range(max(0, cx - r), min(width, cx + r + 1)):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2:
                idx = (y * width + x) * 3
                pixels[idx] = color[0]
                pixels[idx + 1] = color[1]
                pixels[idx + 2] = color[2]

def generate_icon(size):
    """生成指定尺寸的图标"""
    pixels = [0] * (size * size * 3)
    
    # 红色背景
    bg = (229, 57, 53)  # #E53935
    for i in range(size * size):
        pixels[i * 3] = bg[0]
        pixels[i * 3 + 1] = bg[1]
        pixels[i * 3 + 2] = bg[2]
    
    # 白色圆点 - 5个点（骰子5的布局）
    white = (255, 255, 255)
    margin = size // 4
    dot_r = size // 10
    
    # 5个点位置
    positions = [
        (margin, margin),                    # 左上
        (size - margin, margin),             # 右上
        (size // 2, size // 2),              # 中间
        (margin, size - margin),             # 左下
        (size - margin, size - margin),      # 右下
    ]
    
    for cx, cy in positions:
        draw_circle(pixels, size, cx, cy, dot_r, white)
    
    return create_png(size, size, pixels)

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(script_dir, 'icons')
    os.makedirs(icons_dir, exist_ok=True)
    
    sizes = [192, 512]
    
    for size in sizes:
        data = generate_icon(size)
        path = os.path.join(icons_dir, f'icon-{size}.png')
        with open(path, 'wb') as f:
            f.write(data)
        print(f'Generated: {path} ({len(data)} bytes)')
    
    # 同时为 Android 生成不同密度的图标
    android_sizes = {
        'mdpi': 48,
        'hdpi': 72,
        'xhdpi': 96,
        'xxhdpi': 144,
        'xxxhdpi': 192,
    }
    
    android_res = os.path.join(script_dir, 'android', 'app', 'src', 'main', 'res')
    for density, size in android_sizes.items():
        mipmap_dir = os.path.join(android_res, f'mipmap-{density}')
        os.makedirs(mipmap_dir, exist_ok=True)
        data = generate_icon(size)
        for name in ['ic_launcher.png', 'ic_launcher_round.png']:
            path = os.path.join(mipmap_dir, name)
            with open(path, 'wb') as f:
                f.write(data)
        print(f'Generated Android {density}: {size}x{size}')
    
    print('\nDone! All icons generated.')

if __name__ == '__main__':
    main()

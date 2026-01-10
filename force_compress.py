import os
from PIL import Image

# --- 設定區 ---
# 取得目前腳本所在的資料夾路徑
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 設定圖片資料夾: 自動抓取 public/images
# 這樣無論您在終端機哪一層執行，只要腳本跟 public 資料夾在同一層就沒問題
TARGET_DIR = os.path.join(BASE_DIR, "public", "images")

# 目標大小: 2MB
MAX_SIZE = 2 * 1024 * 1024 

def compress_until_fit(file_path):
    try:
        # 1. 檢查檔案大小
        file_size = os.path.getsize(file_path)
        if file_size <= MAX_SIZE:
            return # 大小合格，直接跳過

        print(f"🔥 發現大檔: {os.path.basename(file_path)} ({file_size / 1024 / 1024:.2f} MB)")

        # 2. 開啟圖片
        img = Image.open(file_path)
        img_format = img.format # 記住原本的格式
        
        img = img.copy() 
        
        # 3. 暴力迴圈：只要大於 2MB 就一直縮小
        while os.path.getsize(file_path) > MAX_SIZE:
            # 每次長寬都縮小成 0.9 倍 (保持比例)
            width, height = img.size
            new_width = int(width * 0.9)
            new_height = int(height * 0.9)

            if new_width < 300:
                print("  ⚠️ 已縮至極限，停止壓縮。")
                break

            # 高品質縮圖
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

            # 4. 覆蓋原檔
            try:
                img.save(file_path, format=img_format, optimize=True, quality=85)
            except:
                img.save(file_path, format=img_format, optimize=True)

            current_size = os.path.getsize(file_path)
            print(f"  -> 縮小至 {new_width}x{new_height}, 目前大小: {current_size / 1024 / 1024:.2f} MB")

        print("  ✅ 完成！")

    except Exception as e:
        print(f"  ❌ [錯誤] 無法處理 {file_path}: {e}")

def main():
    if not os.path.exists(TARGET_DIR):
        print(f"❌ 找不到資料夾: {TARGET_DIR}")
        print(f"請確認您的專案結構是否包含 public/images")
        return

    print(f"🚀 開始掃描資料夾: {TARGET_DIR}")
    
    # 遞迴搜尋所有檔案
    count = 0
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                full_path = os.path.join(root, file)
                compress_until_fit(full_path)
                count += 1

    print(f"🎉 全部掃描完畢！共檢查 {count} 張圖片。")

if __name__ == "__main__":
    main()
import csv
import json
import re

materials_csv = r'C:\Users\User\OneDrive\桌面\CFV\CFV\Emission-source\原(燃)物料種類.csv'
equipments_csv = r'C:\Users\User\OneDrive\桌面\CFV\CFV\Emission-source\設備名稱.csv'
out_js = r'C:\Users\User\OneDrive\桌面\CFV\CFV\Emission-source\mapping_data.js'

tree = {
    'materials': {},
    'equipments': {}
}

# 規則定義：透過關鍵字判斷型式與溫室氣體
def determine_ghg_scope(name):
    if re.search(r'汽油|柴油|車|航空|機車|船舶', name):
        return '範疇一 (移動燃燒)', ['CO₂', 'CH₄', 'N₂O']
    elif re.search(r'電力|電', name):
        return '範疇二 (外購電力)', ['CO₂']
    elif re.search(r'冷媒|R-\d+|滅火|六氟化硫|全氟', name, re.IGNORECASE):
        return '範疇一 (逸散排放)', ['HFCs']
    elif re.search(r'天然氣|瓦斯|煤|氣|油|柴|燃', name):
        return '範疇一 (固定燃燒)', ['CO₂', 'CH₄', 'N₂O']
    return None, None

# 讀取原(燃)物料 (注意 CSV 編碼通常是 Big5)
with open(materials_csv, 'r', encoding='big5', errors='replace') as f:
    reader = csv.reader(f)
    next(reader) # 跳過標題列
    for row in reader:
        if len(row) >= 3:
            code, name = row[1].strip(), row[2].strip()
            if code and name:
                scope, ghg = determine_ghg_scope(name)
                # 以代碼為 Key 建立字典
                tree['materials'][code] = {
                    'name': name,
                    'scope': scope,
                    'ghg': ghg
                }

# 讀取設備名稱
with open(equipments_csv, 'r', encoding='big5', errors='replace') as f:
    reader = csv.reader(f)
    next(reader)
    for row in reader:
        if len(row) >= 3:
            code, name = row[1].strip(), row[2].strip()
            if code and name:
                tree['equipments'][code] = { 'name': name }

# 輸出成前端可直接讀取的 JS 格式
with open(out_js, 'w', encoding='utf-8') as f:
    f.write('window.CFV_MAPPING = ')
    json.dump(tree, f, ensure_ascii=False, separators=(',', ':'))
    f.write(';\n')

print(f"✅ 轉換成功！共處理 {len(tree['materials'])} 筆物料與 {len(tree['equipments'])} 筆設備。")

import csv, json, re
import os

materials_csv = r'c:\Users\User\OneDrive\桌面\CFV\CFV\Emission-source\原(燃)物料種類.csv'
equipments_csv = r'c:\Users\User\OneDrive\桌面\CFV\CFV\Emission-source\設備名稱.csv'
out_js = r'c:\Users\User\OneDrive\桌面\CFV\CFV\Emission-source\mapping_data.js'

tree = {
    'materials': {},
    'equipments': {},
    'ghg_rules': {}
}

ghg_csv = r'c:\Users\User\OneDrive\桌面\CFV\CFV\Emission-source\溫室氣體種類.csv'

with open(ghg_csv, 'r', encoding='utf-8-sig', errors='replace') as f:
    reader = csv.reader(f)
    next(reader)
    for row in reader:
        if len(row) >= 5:
            emission_type = row[1].strip()
            ghg = row[2].strip()
            mat_name = row[4].strip()
            if mat_name and emission_type and ghg:
                if mat_name not in tree['ghg_rules']:
                    tree['ghg_rules'][mat_name] = {}
                if emission_type not in tree['ghg_rules'][mat_name]:
                    tree['ghg_rules'][mat_name][emission_type] = []
                if ghg not in tree['ghg_rules'][mat_name][emission_type]:
                    tree['ghg_rules'][mat_name][emission_type].append(ghg)

# 規則定義
def determine_ghg_scope(name):
    name = name.lower()
    if re.search(r'汽油|柴油|車|航空|機車|船舶', name):
        return '範疇一 (移動燃燒)', ['CO₂', 'CH₄', 'N₂O']
    elif re.search(r'電力|電', name):
        return '範疇二 (外購電力)', ['CO₂']
    elif re.search(r'冷媒|r-\d+|滅火|六氟化硫|全氟', name):
        return '範疇一 (逸散排放)', ['HFCs']
    elif re.search(r'天然氣|瓦斯|煤|氣|油|柴|燃', name):
        return '範疇一 (固定燃燒)', ['CO₂', 'CH₄', 'N₂O']
    return None, None

# 讀取物料
with open(materials_csv, 'r', encoding='big5', errors='replace') as f:
    reader = csv.reader(f)
    next(reader)
    for row in reader:
        if len(row) >= 3:
            code, name = row[1].strip(), row[2].strip()
            if code and name:
                scope, ghg = determine_ghg_scope(name)
                tree['materials'][code] = {
                    'name': name,
                    'scope': scope,
                    'ghg': ghg
                }

# 讀取設備
with open(equipments_csv, 'r', encoding='big5', errors='replace') as f:
    reader = csv.reader(f)
    next(reader)
    for row in reader:
        if len(row) >= 3:
            code, name = row[1].strip(), row[2].strip()
            if code and name:
                tree['equipments'][code] = { 'name': name }

# 產生 JS
with open(out_js, 'w', encoding='utf-8') as f:
    f.write('window.CFV_MAPPING = ')
    json.dump(tree, f, ensure_ascii=False, separators=(',', ':'))
    f.write(';\n')

print(f"Processed {len(tree['materials'])} materials and {len(tree['equipments'])} equipments.")

# Print a small sample for the user
sample_keys = ['010002', '010004', 'EL0001', '010013', '190239']
sample = {}
for k in sample_keys:
    if k in tree['materials']:
        sample[k] = tree['materials'][k]
with open('sample.json', 'w', encoding='utf-8') as f:
    json.dump(sample, f, ensure_ascii=False, indent=2)

# ==============================================================================
# 開心農場：綠色碳管理養成遊戲 - Godot 4.x 主遊戲管理器 (game_manager.gd)
# 完整功能：動態初始型態、What-If 模擬擴建、高碳排警告、5年減碳計算、XP等級系統
# ==============================================================================
extends Node

# 訊號廣播事件 (Signals)
signal inventory_updated
signal xp_changed(new_xp: int)
signal budget_changed(new_budget: float)
signal carbon_updated(base_carbon: float, current_carbon: float, savings_5yr: float)

# 玩家數據與等級狀態
var company_name: String = "綠洲農場與綠色企業場域"
var user_level: int = 2
var user_xp: int = 650
var max_xp: int = 1000
var user_budget: float = 500.0 # 單位: 萬台幣

# 1. 盤查數據庫 (完整對接功能一二三數據)
var records: Array = [
	{
		"id": 1,
		"name": "門市冷氣空調 (舊型R22)",
		"fuel": "冷氣冷媒(R-22)",
		"scope": "Scope 1 - 逸散排放",
		"activity": 3.5,
		"unit": "kg",
		"factor": 1810,
		"carbon": 6.34,
		"icon": "❄️",
		"gwp": 1810,
		"is_high_carbon": true,
		"plot_type": "ac",
		"ref_price": 12.0
	},
	{
		"id": 2,
		"name": "物流載貨柴油車",
		"fuel": "車用柴油",
		"scope": "Scope 1 - 移動燃燒",
		"activity": 1800,
		"unit": "公升",
		"factor": 2.66,
		"carbon": 4.79,
		"icon": "🚚",
		"gwp": 1,
		"is_high_carbon": false,
		"plot_type": "truck",
		"ref_price": 18.0
	},
	{
		"id": 3,
		"name": "備用柴油發電機",
		"fuel": "柴油發電機燃料",
		"scope": "Scope 1 - 固定燃燒",
		"activity": 850,
		"unit": "公升",
		"factor": 2.66,
		"carbon": 2.26,
		"icon": "⚡",
		"gwp": 1,
		"is_high_carbon": true,
		"plot_type": "generator",
		"ref_price": 15.0
	},
	{
		"id": 4,
		"name": "全廠基礎照明與用電",
		"fuel": "外購電力",
		"scope": "Scope 2 - 外購電力",
		"activity": 6240,
		"unit": "度 (kWh)",
		"factor": 0.495,
		"carbon": 3.09,
		"icon": "💡",
		"gwp": 1,
		"is_high_carbon": false,
		"plot_type": "power",
		"ref_price": 8.0
	}
]

# 2. What-If 模擬擴建項目陣列
var simulated_items: Array = []

# 已安裝綠色替代之設備集合
var installed_replacements: Dictionary = {}

func _ready() -> void:
	print("[Godot Game Engine] 綠色碳管理遊戲管理器載入完成。")
	recalculate_carbon()

# 計算初始基準年碳排當量 (tCO2e)
func get_base_carbon() -> float:
	var total: float = 0.0
	for rec in records:
		total += float(rec["carbon"])
	return snapped(total, 0.01)

# 計算綠色升級後當前年碳排當量 (tCO2e)
func get_current_carbon() -> float:
	var total: float = get_base_carbon()
	for rec in records:
		var rec_id = rec["id"]
		if installed_replacements.has(rec_id):
			total -= float(rec["carbon"]) * 0.75
	return max(0.0, snapped(total, 0.01))

# 計算預估 5 年累計減碳當量 (5-Year Carbon Savings = Annual Savings * 5)
func get_5year_carbon_savings() -> float:
	var annual_savings: float = 0.0
	for rec in records:
		var rec_id = rec["id"]
		if installed_replacements.has(rec_id):
			annual_savings += float(rec["carbon"]) * 0.75
	return snapped(annual_savings * 5.0, 0.1)

# 計算擴建後新總碳排 (Base/Current + Simulated)
func get_simulated_total_carbon() -> float:
	var total: float = get_current_carbon()
	for sim in simulated_items:
		total += float(sim["carbon"])
	return snapped(total, 0.01)

# 重新計算並廣播全域碳數據
func recalculate_carbon() -> void:
	var b_carb = get_base_carbon()
	var c_carb = get_current_carbon()
	var s_5yr = get_5year_carbon_savings()
	emit_signal("carbon_updated", b_carb, c_carb, s_5yr)

# 執行綠色替代替換
func apply_eco_replacement(item_id: int, price: float) -> bool:
	if user_budget < price or installed_replacements.has(item_id):
		return false
	
	user_budget -= price
	installed_replacements[item_id] = true
	add_xp(200)
	
	emit_signal("budget_changed", user_budget)
	recalculate_carbon()
	emit_signal("inventory_updated")
	return true

# 新增模擬擴建設備 (What-If Simulator)
func add_simulated_item(item_name: String, item_type: String, extra_carbon: float) -> void:
	var sim_obj = {
		"id": Time.get_ticks_msec(),
		"name": item_name,
		"type": item_type,
		"carbon": extra_carbon
	}
	simulated_items.append(sim_obj)
	recalculate_carbon()
	emit_signal("inventory_updated")

# 增加經驗值 (XP)
func add_xp(amount: int) -> void:
	user_xp += amount
	if user_xp >= max_xp:
		user_level += 1
		user_xp -= max_xp
		print("[Godot Level Up] 恭喜解鎖新農地！目前等級 LV. ", user_level)
	emit_signal("xp_changed", user_xp)

# 新增盤查設備 (連動功能一二三)
func add_inventory_record(name: String, fuel: String, activity: float, unit: String, factor: float, plot_type: String) -> void:
	var carb = snapped((activity * factor) / 1000.0, 0.01)
	var is_high = (fuel.find("R-22") != -1 or fuel.find("R-404A") != -1 or fuel.find("發電機") != -1)
	var icon_symbol = "❄️" if plot_type == "ac" else ("🚚" if plot_type == "truck" else "⚡")
	
	var new_rec = {
		"id": Time.get_ticks_msec(),
		"name": name,
		"fuel": fuel,
		"scope": "Scope 1 - 逸散/燃燒",
		"activity": activity,
		"unit": unit,
		"factor": factor,
		"carbon": carb,
		"icon": icon_symbol,
		"gwp": 1810 if is_high else 1,
		"is_high_carbon": is_high,
		"plot_type": plot_type,
		"ref_price": 12.0
	}
	records.append(new_rec)
	recalculate_carbon()
	emit_signal("inventory_updated")

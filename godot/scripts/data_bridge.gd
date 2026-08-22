# ==============================================================================
# 開心農場：綠色碳管理養成遊戲 - 數據橋接器 (data_bridge.gd)
# 負責解析外部 JSON 盤查數據、導出 Excel/JSON 與與 Web 通訊
# ==============================================================================
extends Node

# 載入外部 JSON 盤查數據
func load_inventory_json(json_string: String) -> Array:
	var json = JSON.new()
	var parse_result = json.parse(json_string)
	if parse_result == OK:
		var data = json.get_data()
		if typeof(data) == TYPE_ARRAY:
			print("[DataBridge] 成功載入 ", data.size(), " 筆外部盤查數據。")
			return data
	push_error("[DataBridge] JSON 解析失敗。")
	return []

# 將盤查數據導出為 JSON 字串
func export_inventory_json(records: Array) -> String:
	return JSON.stringify(records, "\t")

# ==============================================================================
# 開心農場：綠色碳管理養成遊戲 - 數據橋接器 (data_bridge.gd)
# ==============================================================================
extends Node

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

func export_inventory_json(records: Array) -> String:
	return JSON.stringify(records, "\t")

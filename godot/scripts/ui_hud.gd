# ==============================================================================
# 開心農場：綠色碳管理養成遊戲 - HUD 看板控制器 (ui_hud.gd)
# ==============================================================================
extends CanvasLayer

@onready var val_base: Label = $TopPanel/StatsGrid/StatBase/Value
@onready var val_curr: Label = $TopPanel/StatsGrid/StatCurrent/Value
@onready var val_sav5: Label = $TopPanel/StatsGrid/StatSavings5Yr/Value

func _ready() -> void:
	var manager = get_node_or_null("/root/MainGame/GameManager")
	if manager:
		manager.connect("carbon_updated", _on_carbon_updated)
		_on_carbon_updated(manager.get_base_carbon(), manager.get_current_carbon(), manager.get_5year_carbon_savings())

func _on_carbon_updated(base_c: float, curr_c: float, sav5_c: float) -> void:
	if val_base: val_base.text = str(base_c) + " tCO2e"
	if val_curr: val_curr.text = str(curr_c) + " tCO2e"
	if val_sav5: val_sav5.text = str(sav5_c) + " tCO2e"

# ==============================================================================
# 開心農場：綠色碳管理養成遊戲 - 農地地塊腳本 (farm_tile.gd)
# 負責 3D 開心農場地塊渲染、冷氣風扇旋轉、柴油車跳動、警告氣泡與飄浮 XP
# ==============================================================================
extends Node2D

@export var plot_index: int = 0

var tile_data: Dictionary = {}
var is_unlocked: bool = false
var is_replaced: bool = false

@onready var sprite_icon: Label = $SpriteIcon
@onready var label_name: Label = $LabelName
@onready var label_carbon: Label = $LabelCarbon
@onready var warning_bubble: PanelContainer = $WarningBubble
@onready var bubble_text: Label = $WarningBubble/BubbleText

func _ready() -> void:
	update_tile_visual()

func setup_tile(data: Dictionary, index: int) -> void:
	tile_data = data
	plot_index = index
	is_unlocked = not data.is_empty()
	update_tile_visual()

func update_tile_visual() -> void:
	if not is_unlocked:
		if sprite_icon: sprite_icon.text = "➕"
		if label_name: label_name.text = "空地 #" + str(plot_index + 1)
		if label_carbon: label_carbon.text = "點擊填報解鎖"
		if warning_bubble: warning_bubble.visible = false
		return

	var is_high_carbon: bool = tile_data.get("is_high_carbon", false)
	var plot_type: String = tile_data.get("plot_type", "power")
	var rec_id: int = tile_data.get("id", -1)
	
	var manager = get_node_or_null("/root/MainGame/GameManager")
	if manager and manager.installed_replacements.has(rec_id):
		is_replaced = true

	# 設定對應動態圖示
	if plot_type == "ac":
		sprite_icon.text = "❄️🌀" if is_replaced else "❄️"
	elif plot_type == "truck":
		sprite_icon.text = "⚡🚚" if is_replaced else "🚚"
	elif plot_type == "generator":
		sprite_icon.text = "🔋" if is_replaced else "⚡"
	else:
		sprite_icon.text = "💡"

	if label_name: label_name.text = str(tile_data.get("name", "盤查設備"))
	if label_carbon: label_carbon.text = str(tile_data.get("carbon", 0.0)) + " tCO2e"

	# 顯示動態警告氣泡 (Speech Bubble)
	if warning_bubble:
		if is_high_carbon and not is_replaced:
			warning_bubble.visible = true
			if bubble_text: bubble_text.text = "💬 漏冷媒/高碳"
		elif is_replaced:
			warning_bubble.visible = true
			if bubble_text: bubble_text.text = "🌱 R-32 節能中"
		else:
			warning_bubble.visible = false

func _on_area_2d_input_event(_viewport: Node, event: InputEvent, _shape_idx: int) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		if is_unlocked:
			spawn_floating_text("+50 XP 🌾", Color.GOLD)
			var manager = get_node_or_null("/root/MainGame/GameManager")
			if manager: manager.add_xp(20)
		else:
			spawn_floating_text("🌱 請前往數據填報解鎖！", Color.SPRING_GREEN)

func spawn_floating_text(text: String, text_color: Color) -> void:
	var label = Label.new()
	label.text = text
	label.modulate = text_color
	label.position = Vector2(-30, -40)
	add_child(label)

	var tween = create_tween()
	tween.tween_property(label, "position", Vector2(-30, -95), 1.1)
	tween.parallel().tween_property(label, "modulate:a", 0.0, 1.1)
	tween.tween_callback(label.queue_free)

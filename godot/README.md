# 開心農場：綠色碳管理養成遊戲 (Godot 4.x Engine 專案)

本目錄包含完整的 **Godot Engine 4.x** 養成遊戲專案。

---

## 📂 專案檔案架構

- **`project.godot`**：Godot 4.x 專案核心設定檔。
- **`scenes/`**：
  - `main_game.tscn`：主遊戲場景 (視角、HUD 介面與 12 格農地網格)。
  - `farm_tile.tscn`：獨立地塊 Area2D 節點 (含氣泡與文字)。
  - `ui_hud.tscn`：HUD 頂部資訊看板 (XP、碳當量、5 年減碳目標)。
- **`scripts/`**：
  - `game_manager.gd`：遊戲核心管理器 (GDScript 狀態庫、5年減碳當量數學計算)。
  - `farm_tile.gd`：農地互動腳本 (點擊觸發 `+50 XP` 飄浮效果與冷氣轉動/車輛動畫)。
  - `data_bridge.gd`：數據橋接器 (讀取功能一二三數據 JSON)。

---

## 🎮 開啟與執行方式 (How to Run)

1. 下載並安裝 [Godot Engine 4.x 官方軟體](https://godotengine.org/)。
2. 開啟 Godot Engine，點擊 **「匯入 (Import)」**。
3. 選擇路徑：`/Users/eugenia/Desktop/carbon/godot/project.godot`。
4. 點擊 **「匯入並編輯 (Import & Edit)」** 即可進入 Godot 視覺化編輯器！
5. 按下右上角的 `Play (F5)` 鍵即可直接在 Godot 視窗中進行測試與遊玩！

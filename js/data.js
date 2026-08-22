/**
 * 開心農場式：綠色碳管理養成遊戲 - 數據模組 (js/data.js)
 * 包含預設盤查數據庫、溫室氣體排放係數對照表 (FACTOR_MAP)、遊戲狀態變數
 */

// 1. 預設使用者功能一二三盤查數據庫
let records = [
  { id: 1, name: "門市冷氣空調 (舊型R22)", fuel: "冷氣冷媒(R-22)", scope: "Scope 1 - 逸散排放", activity: 3.5, unit: "kg", factor: 1810, carbon: 6.34, icon: "❄️", gwp: 1810, isHighCarbon: true, plotType: "ac" },
  { id: 2, name: "物流載貨柴油車", fuel: "車用柴油", scope: "Scope 1 - 移動燃燒", activity: 1800, unit: "公升", factor: 2.66, carbon: 4.79, icon: "🚚", gwp: 1, isHighCarbon: false, plotType: "truck" },
  { id: 3, name: "備用柴油發電機", fuel: "柴油發電機燃料", scope: "Scope 1 - 固定燃燒", activity: 850, unit: "公升", factor: 2.66, carbon: 2.26, icon: "⚡", gwp: 1, isHighCarbon: true, plotType: "generator" },
  { id: 4, name: "全廠基礎照明與用電", fuel: "外購電力", scope: "Scope 2 - 外購電力", activity: 6240, unit: "度 (kWh)", factor: 0.495, carbon: 3.09, icon: "💡", gwp: 1, isHighCarbon: false, plotType: "power" }
];

// 2. 溫室氣體與冷媒排放係數／GWP 全域對照表
const FACTOR_MAP = {
  "冷氣冷媒(R-22)": { factor: 1810, unit: "kg", scope: "Scope 1 - 逸散排放", icon: "❄️", gwp: 1810, isHighCarbon: true, plotType: "ac" },
  "外購電力": { factor: 0.495, unit: "度 (kWh)", scope: "Scope 2 - 外購電力", icon: "💡", gwp: 1, isHighCarbon: false, plotType: "power" },
  "車用柴油": { factor: 2.66, unit: "公升", scope: "Scope 1 - 移動燃燒", icon: "🚚", gwp: 1, isHighCarbon: false, plotType: "truck" },
  "柴油發電機燃料": { factor: 2.66, unit: "公升", scope: "Scope 1 - 固定燃燒", icon: "⚡", gwp: 1, isHighCarbon: true, plotType: "generator" },
  "冷藏冷媒(R-404A)": { factor: 3922, unit: "kg", scope: "Scope 1 - 逸散排放", icon: "❄️", gwp: 3922, isHighCarbon: true, plotType: "ac" }
};

// 3. 遊戲狀態數據 Store
let simulatedItems = [];
let userXp = 650;
let userBudget = 500; // 萬台幣
let installedReplacements = new Set();

// 4. 全局碳排計算輔助函式
function getBaseCarbon() {
  return records.reduce((sum, item) => sum + item.carbon, 0);
}

function getCurrentCarbon() {
  let total = getBaseCarbon();
  installedReplacements.forEach(recId => {
    const item = records.find(r => r.id === recId);
    if (item) total -= (item.carbon * 0.75);
  });
  return Math.max(0, Math.round(total * 100) / 100);
}

function get5YearCarbonSavings() {
  let annualSavings = 0;
  installedReplacements.forEach(recId => {
    const item = records.find(r => r.id === recId);
    if (item) annualSavings += (item.carbon * 0.75);
  });
  return Math.round(annualSavings * 5 * 10) / 10;
}

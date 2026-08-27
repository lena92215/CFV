/* =============================================
   CFV 碳排放遊戲 - 扁平向量卡通風格邏輯
   game/game.js
   ============================================= */

'use strict';

// =============================================
// 1. 扁平向量 SVG Sprites 資料庫
// =============================================

const VECTOR_SVG_SPRITES = {
  // 冷氣 / 空調 (Squorcle + Capsule Vent + Pill Shadow)
  ac: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="52" width="36" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <rect x="8" y="16" width="48" height="32" rx="10" fill="#38BDF8" stroke="#0F172A" stroke-width="3.5"/>
    <rect x="14" y="24" width="36" height="8" rx="4" fill="#E0F2FE" stroke="#0F172A" stroke-width="2.5"/>
    <circle cx="20" cy="38" r="3" fill="#0284C7"/>
    <circle cx="32" cy="38" r="3" fill="#0284C7"/>
    <circle cx="44" cy="38" r="3" fill="#0284C7"/>
  </svg>`,

  // 中大型冷藏 / 冷庫裝備 (Vertical Capsule + Dual Handles + Pill Shadow)
  fridge: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="54" width="32" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <rect x="14" y="8" width="36" height="46" rx="12" fill="#7DD3FC" stroke="#0F172A" stroke-width="3.5"/>
    <line x1="14" y1="28" x2="50" y2="28" stroke="#0F172A" stroke-width="3"/>
    <rect x="40" y="16" width="4" height="8" rx="2" fill="#0284C7" stroke="#0F172A" stroke-width="2"/>
    <rect x="40" y="34" width="4" height="12" rx="2" fill="#0284C7" stroke="#0F172A" stroke-width="2"/>
  </svg>`,

  // 小貨車 / 載貨車輛 (Rounded Cabin + Pill Wheels + Pill Shadow)
  car: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="50" width="40" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <rect x="8" y="24" width="48" height="20" rx="8" fill="#FB923C" stroke="#0F172A" stroke-width="3.5"/>
    <path d="M34 14H46C49 14 52 16 54 20L56 24H34V14Z" fill="#FDBA74" stroke="#0F172A" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="20" cy="46" r="7" fill="#334155" stroke="#0F172A" stroke-width="3.5"/>
    <circle cx="44" cy="46" r="7" fill="#334155" stroke="#0F172A" stroke-width="3.5"/>
    <circle cx="20" cy="46" r="2.5" fill="#FFFFFF"/>
    <circle cx="44" cy="46" r="2.5" fill="#FFFFFF"/>
  </svg>`,

  // 大卡車 / 冷藏車 (Squorcle Box + Curved Cabin + Pill Shadow)
  truck: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="52" width="44" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <rect x="6" y="14" width="34" height="30" rx="8" fill="#F8FAFC" stroke="#0F172A" stroke-width="3.5"/>
    <path d="M40 22H50C53 22 56 25 57 29L58 32V44H40V22Z" fill="#38BDF8" stroke="#0F172A" stroke-width="3.5" stroke-linejoin="round"/>
    <circle cx="18" cy="46" r="7" fill="#334155" stroke="#0F172A" stroke-width="3.5"/>
    <circle cx="48" cy="46" r="7" fill="#334155" stroke="#0F172A" stroke-width="3.5"/>
  </svg>`,

  // 柴油發電機 (Box Frame + Gear Circle + Top Valve)
  generator: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="52" width="36" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <rect x="10" y="16" width="44" height="36" rx="10" fill="#C084FC" stroke="#0F172A" stroke-width="3.5"/>
    <circle cx="32" cy="34" r="10" fill="#E9D5FF" stroke="#0F172A" stroke-width="3"/>
    <path d="M32 24V44M22 34H42" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
    <rect x="22" y="10" width="8" height="6" rx="3" fill="#7E22CE" stroke="#0F172A" stroke-width="2"/>
  </svg>`,

  // 電錶 / 外購電力 (Rounded Yellow Capsule + Bolt)
  electricity: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="52" width="32" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <rect x="12" y="10" width="40" height="42" rx="12" fill="#FACC15" stroke="#0F172A" stroke-width="3.5"/>
    <circle cx="32" cy="31" r="13" fill="#FEF08A" stroke="#0F172A" stroke-width="3"/>
    <path d="M34 21L26 33H34L30 41" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // 瓦斯 / 燃氣 (Capsule Tank + Rounded Valve)
  gas: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="52" width="24" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <rect x="18" y="18" width="28" height="34" rx="10" fill="#F97316" stroke="#0F172A" stroke-width="3.5"/>
    <rect x="26" y="10" width="12" height="8" rx="3" fill="#CBD5E1" stroke="#0F172A" stroke-width="3"/>
    <path d="M32 26C32 26 37 32 32 40C27 32 32 26 32 26Z" fill="#FEF08A" stroke="#0F172A" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`,

  // 化糞池 / 污水處理 (馬桶 + 便便 Icon)
  septic: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="52" width="36" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <!-- 馬桶水箱 -->
    <rect x="16" y="10" width="32" height="20" rx="6" fill="#F8FAFC" stroke="#0F172A" stroke-width="3.5"/>
    <rect x="28" y="14" width="8" height="4" rx="2" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
    <!-- 馬桶座底 -->
    <path d="M14 30H50V38C50 46 42 50 32 50C22 50 14 46 14 38V30Z" fill="#F8FAFC" stroke="#0F172A" stroke-width="3.5"/>
    <!-- 便便 (Poop Vector) -->
    <path d="M32 32C34 32 36 33.5 35 35.5C37 36 38 38 36.5 40C38.5 41 38 44 35.5 44.5C34 44.8 28 44.8 26.5 44.5C24 44 23.5 41 25.5 40C24 38 25 36 27 35.5C26 33.5 28 32 32 32Z" fill="#78350F" stroke="#0F172A" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="30" cy="36" r="1" fill="#FFFFFF"/>
  </svg>`,

  // 消防設施 / 滅火器 (Red Cylinder + Top Nozzle)
  fire: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="52" width="20" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <rect x="20" y="20" width="24" height="32" rx="9" fill="#F43F5E" stroke="#0F172A" stroke-width="3.5"/>
    <rect x="28" y="10" width="8" height="10" rx="3" fill="#CBD5E1" stroke="#0F172A" stroke-width="3"/>
    <rect x="26" y="30" width="12" height="12" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
  </svg>`,

  // 1. 鍋爐 / 蒸氣大鍋子 (Big Cauldron / Pot with Steam)
  boiler: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="52" width="36" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <!-- 兩側耳把 -->
    <rect x="8" y="26" width="8" height="12" rx="4" fill="#F97316" stroke="#0F172A" stroke-width="3"/>
    <rect x="48" y="26" width="8" height="12" rx="4" fill="#F97316" stroke="#0F172A" stroke-width="3"/>
    <!-- 大鍋子主體 -->
    <path d="M12 22H52V34C52 44 43 50 32 50C21 50 12 44 12 34V22Z" fill="#FB923C" stroke="#0F172A" stroke-width="3.5"/>
    <rect x="10" y="18" width="44" height="6" rx="3" fill="#FED7AA" stroke="#0F172A" stroke-width="3"/>
    <!-- 沸騰蒸汽泡泡 -->
    <circle cx="24" cy="12" r="3" fill="#FDE68A" stroke="#0F172A" stroke-width="2"/>
    <circle cx="34" cy="9" r="4" fill="#FDE68A" stroke="#0F172A" stroke-width="2"/>
    <circle cx="42" cy="13" r="2.5" fill="#FDE68A" stroke="#0F172A" stroke-width="2"/>
  </svg>`,

  // 2. 渦輪機 (Turbine - Rounded Housing + Fan Blades)
  turbine: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="52" width="32" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <!-- 外殼底座 -->
    <rect x="24" y="44" width="16" height="10" rx="3" fill="#64748B" stroke="#0F172A" stroke-width="3"/>
    <!-- 圓形風扇外殼 -->
    <circle cx="32" cy="28" r="20" fill="#0284C7" stroke="#0F172A" stroke-width="3.5"/>
    <circle cx="32" cy="28" r="14" fill="#38BDF8" stroke="#0F172A" stroke-width="2.5"/>
    <!-- 渦輪葉片與軸心 -->
    <path d="M32 16L35 25M44 28L35 31M32 40L29 31M20 28L29 25" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="32" cy="28" r="5" fill="#BAE6FD" stroke="#0F172A" stroke-width="2.5"/>
  </svg>`,

  // 3. 焚化爐 (Incinerator - Furnace Tower + Fire Chamber)
  incinerator: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="52" width="36" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <!-- 煙囪 -->
    <rect x="36" y="8" width="10" height="16" rx="3" fill="#64748B" stroke="#0F172A" stroke-width="3"/>
    <!-- 爐體 -->
    <rect x="12" y="20" width="40" height="32" rx="8" fill="#E11D48" stroke="#0F172A" stroke-width="3.5"/>
    <!-- 觀察窗與火焰 -->
    <rect x="22" y="28" width="20" height="16" rx="5" fill="#1E293B" stroke="#0F172A" stroke-width="2.5"/>
    <path d="M32 32C32 32 37 37 34 42C31 44 29 41 32 32Z" fill="#FACC15" stroke="#0F172A" stroke-width="2"/>
    <!-- 煙囪微煙 -->
    <circle cx="41" cy="5" r="2.5" fill="#CBD5E1"/>
  </svg>`,

  // 4. 工業機台 / 機 (Machinery Unit - Panel & Gears)
  machine: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="52" width="40" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <!-- 機台主體 -->
    <rect x="10" y="14" width="44" height="38" rx="10" fill="#6366F1" stroke="#0F172A" stroke-width="3.5"/>
    <!-- 螢幕面板 -->
    <rect x="16" y="20" width="20" height="14" rx="4" fill="#38BDF8" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="20" y1="27" x2="30" y2="27" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
    <!-- 控制按鈕 -->
    <circle cx="42" cy="24" r="3.5" fill="#34D399" stroke="#0F172A" stroke-width="2"/>
    <circle cx="42" cy="34" r="3.5" fill="#F43F5E" stroke="#0F172A" stroke-width="2"/>
    <!-- 機台底盤軸傳動 -->
    <rect x="16" y="40" width="32" height="6" rx="3" fill="#475569" stroke="#0F172A" stroke-width="2"/>
  </svg>`,

  // 其他 / 預設 (Grey Rounded Box)
  other: `<svg class="vector-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="52" width="36" height="6" rx="3" fill="rgba(0,0,0,0.18)"/>
    <rect x="10" y="14" width="44" height="38" rx="12" fill="#94A3B8" stroke="#0F172A" stroke-width="3.5"/>
    <path d="M22 28H42M22 38H34" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`
};

// 設備對照配置
const DEVICE_CONFIGS = {
  '外購電力':          { type: 'electricity', vectorKey: 'electricity', label: '電力設施',  gwpFactor: 0.495 },
  '電錶(計算電力用)':  { type: 'electricity', vectorKey: 'electricity', label: '電力電錶',  gwpFactor: 0.495 },
  '車用汽油':          { type: 'car',         vectorKey: 'car',         label: '汽油車輛',  gwpFactor: 2.263 },
  '車用柴油':          { type: 'truck',       vectorKey: 'truck',       label: '柴油車輛',  gwpFactor: 2.606 },
  '運輸作業車輛':      { type: 'truck',       vectorKey: 'truck',       label: '運輸車輛',  gwpFactor: 2.606 },
  '冷氣冷媒(R-410A)':  { type: 'ac',          vectorKey: 'ac',          label: '冷氣(R410A)', gwpFactor: 0, gwpWarning: { refrigerant: 'R-410A', gwp: 2088 } },
  '住宅及商業建築冷氣機':{ type: 'ac',         vectorKey: 'ac',          label: '門市冷氣',  gwpFactor: 0, gwpWarning: { refrigerant: 'R-410A', gwp: 2088 } },
  '冷藏冷媒(R-404A)':  { type: 'fridge',      vectorKey: 'fridge',      label: '冷藏(R404A)', gwpFactor: 0, gwpWarning: { refrigerant: 'R-404A', gwp: 3922 } },
  '中、大型冷凍、冷藏裝備':{ type: 'fridge',    vectorKey: 'fridge',      label: '大型冷藏庫', gwpFactor: 0, gwpWarning: { refrigerant: 'R-404A', gwp: 3922 } },
  '桶裝瓦斯(LPG)':     { type: 'gas',         vectorKey: 'gas',         label: '桶裝瓦斯',  gwpFactor: 2.998 },
  '天然氣':            { type: 'gas',         vectorKey: 'gas',         label: '天然氣設備', gwpFactor: 1.879 },
  '發電機':            { type: 'generator',   vectorKey: 'generator',   label: '柴油發電機', gwpFactor: 2.606 },
  '柴油發電機組':      { type: 'generator',   vectorKey: 'generator',   label: '柴油發電機', gwpFactor: 2.606 },
  '化糞池':            { type: 'septic',      vectorKey: 'septic',      label: '化糞池/污水', gwpFactor: 1.5 },
  '消防設施':          { type: 'fire',        vectorKey: 'fire',        label: '消防設施',  gwpFactor: 1.0 },
};

const DEFAULT_CONFIG = { type: 'other', vectorKey: 'other', label: '其他設備', gwpFactor: 1.0 };

// GWP 警告與替代品資料庫
const GWP_DB = {
  'R-410A': {
    gwp: 2088,
    status: 'high',
    note: 'HFC 類冷媒，GWP 高達 2088！為 CO₂ 溫室效應的 2088 倍。',
    alternatives: [
      {
        name: 'R-32 環保冷媒', gwp: 675, saving: '68%',
        price: '約 NT$600–900 / kg',
        note: '✅ 目前市場主流替代品，能效提升約 5-10%，大幅降低 GWP 衝擊。'
      }
    ]
  },
  'R-404A': {
    gwp: 3922,
    status: 'critical',
    note: '⛔ 蒙特婁議定書重點列管高危害冷媒！GWP 高達 3922。',
    alternatives: [
      {
        name: 'R-448A 低 GWP 冷媒', gwp: 1387, saving: '65%',
        price: '約 NT$1,500–2,500 / kg',
        note: '✅ 商用冷凍冷藏首選替代方案，可直接替換 R-404A 系統。'
      }
    ]
  }
};

const EMISSION_FACTOR = {
  electricity: 0.495, car: 2.263, truck: 2.606, generator: 2.606,
  gas: 2.998, ac: 2.088, fridge: 3.922, septic: 1.5, fire: 1.0, other: 1.0
};

// =============================================
// 2. 全域狀態
// =============================================
let gameState = {
  devices: [],
  floorPlanImg: null,
  floorPlanBase64: null,
  pixelSize: 6,
  warningsVisible: true,
  selectedDevice: null,
  totalXP: 0,
  companyName: '我的場域',
  simDeviceCounter: 0,
  currentSkin: 'market', // 'market' | 'factory' | 'office'
  activeLocation: 'all', // 目前選取的區域/樓層
  customLocations: []
};

let canvas, ctx, spritesLayer, isDragging = false;
let dragTarget = null, dragOffsetX = 0, dragOffsetY = 0;
let particleInterval = null;

// =============================================
// 3. 初始化
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  spritesLayer = document.getElementById('spritesLayer');

  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); redrawCanvas(); renderSprites(); });

  loadGameData();
  startXPCounter();
  startParticleEngine();
  showRandomTip();
});

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

// =============================================
// 4. 資料載入
// =============================================
function loadGameData() {
  // 1. 公司名稱
  try {
    const companyRaw = localStorage.getItem('cfv_company_info');
    if (companyRaw) {
      const company = JSON.parse(companyRaw);
      gameState.companyName = company.name || '我的場域';
      document.getElementById('gameCompanyName').textContent = gameState.companyName;
    }
  } catch(e) { /* ignore */ }

  // 2. 設備清單 (支援多種 LocalStorage 鍵值)
  try {
    const devicesRaw = localStorage.getItem('cfv_emission_sources') || localStorage.getItem('CFV_EMISSION_SOURCES_V4');
    if (devicesRaw) {
      const sources = JSON.parse(devicesRaw);
      if (Array.isArray(sources) && sources.length > 0) {
        gameState.devices = sources.map((s, i) => {
          const name = s.name || s.equipName || `設備 ${i+1}`;
          const energy = s.energy || s.material || '';
          const config = getDeviceConfig(name, energy);
          return {
            id: `dev_${i}`,
            name: name,
            energy: energy,
            config: config,
            quantity: parseInt(s.quantity) || 1,
            location: s.location || s.process || '主要場域',
            scope: s.scope || getScope(energy),
            x: 80 + (i % 5) * 130,
            y: 80 + Math.floor(i / 5) * 130,
            isSim: false,
            isUpgraded: false
          };
        });
      }
    }
  } catch(e) { /* ignore */ }

  if (!gameState.devices) {
    gameState.devices = [];
  }

  // 3. 場地圖 (未上傳底圖時隱藏預設相片圖層，維持向量質感)
  try {
    const imgData = localStorage.getItem('cfv_floor_plan');
    const overlayEl = document.getElementById('defaultMapOverlay');
    if (imgData) {
      const img = new Image();
      img.onload = () => {
        gameState.floorPlanImg = img;
        if (overlayEl) overlayEl.style.display = 'none';
        redrawCanvas();
      };
      img.src = imgData;
      gameState.floorPlanBase64 = imgData;
    } else {
      if (overlayEl) overlayEl.style.display = 'none';
      redrawCanvas();
    }
  } catch(e) { /* ignore */ }

  document.getElementById('defaultEquipCount').textContent = gameState.devices.length;
  renderAll();
}

function loadODSDemoDevices() {
  const odsData = window.ODS_INVENTORY_DATA || [
    { equipName: '中、大型冷凍、冷藏裝備', material: '冷媒－R404a, R125/143a/134a', process: '冷凍冷藏倉儲服務作業程序' },
    { equipName: '中、大型冷凍、冷藏裝備', material: '冷媒－R408a, R125/R143a/22', process: '冷凍冷藏倉儲服務作業程序' },
    { equipName: '中、大型冷凍、冷藏裝備', material: '冷媒－R417a, R125/134a/600a', process: '冷凍冷藏倉儲服務作業程序' },
    { equipName: '住宅及商業建築冷氣機', material: '冷媒－R410a, R32/125', process: '冷暖氣供應作業程序' },
    { equipName: '運輸作業車輛', material: '98無鉛汽油', process: '交通運輸活動' },
    { equipName: '運輸作業車輛', material: 'HFC-134a/R-134a, CH2FCF3', process: '交通運輸活動' },
    { equipName: '發電機', material: '柴油', process: '引擎發電程序' },
    { equipName: '化糞池', material: '水肥', process: '水肥清除作業程序' },
    { equipName: '消防設施', material: '乾粉滅火藥劑', process: '消防活動' },
    { equipName: '電錶(計算電力用)', material: '外購電力', process: '外購電力程序' }
  ];

  gameState.devices = odsData.map((s, i) => ({
    id: `dev_${i}`,
    name: s.equipName,
    energy: s.material,
    config: getDeviceConfig(s.equipName, s.material),
    quantity: 1,
    location: s.process || '主要場域',
    scope: s.scope || getScope(s.material),
    x: 70 + (i % 4) * 145,
    y: 80 + Math.floor(i / 4) * 135,
    isSim: false,
    isUpgraded: false
  }));
}

// =============================================
// 5. 工具函式
// =============================================
function getDeviceConfig(name, energy) {
  const targetStr = ((name || '') + ' ' + (energy || '')).toLowerCase();
  
  if (targetStr.includes('鍋爐') || targetStr.includes('蒸氣') || targetStr.includes('鍋')) {
    return { type: 'boiler', vectorKey: 'boiler', label: '蒸氣鍋爐', gwpFactor: 2.5 };
  }
  if (targetStr.includes('渦輪') || targetStr.includes('風力') || targetStr.includes('turbine')) {
    return { type: 'turbine', vectorKey: 'turbine', label: '渦輪機組', gwpFactor: 1.2 };
  }
  if (targetStr.includes('焚化') || targetStr.includes('焚化爐') || targetStr.includes('廢棄物')) {
    return { type: 'incinerator', vectorKey: 'incinerator', label: '焚化設施', gwpFactor: 3.2 };
  }
  if (targetStr.includes('冷藏') || targetStr.includes('冷凍') || targetStr.includes('r404') || targetStr.includes('r408') || targetStr.includes('r417') || targetStr.includes('展示櫃')) {
    return { type: 'fridge', vectorKey: 'fridge', label: '大型冷藏庫', gwpFactor: 0, gwpWarning: { refrigerant: 'R-404A', gwp: 3922 } };
  }
  if (targetStr.includes('冷氣') || targetStr.includes('空調') || targetStr.includes('r410') || targetStr.includes('r32')) {
    return { type: 'ac', vectorKey: 'ac', label: '門市冷氣', gwpFactor: 0, gwpWarning: { refrigerant: 'R-410A', gwp: 2088 } };
  }
  if (targetStr.includes('車') || targetStr.includes('運輸') || targetStr.includes('汽油') || targetStr.includes('134a')) {
    if (targetStr.includes('汽油') || targetStr.includes('小貨')) return { type: 'car', vectorKey: 'car', label: '汽油車輛', gwpFactor: 2.263 };
    return { type: 'truck', vectorKey: 'truck', label: '運輸車輛', gwpFactor: 2.606 };
  }
  if (targetStr.includes('發電') || targetStr.includes('引擎')) {
    return { type: 'generator', vectorKey: 'generator', label: '柴油發電機', gwpFactor: 2.606 };
  }
  if (targetStr.includes('化糞池') || targetStr.includes('污水') || targetStr.includes('水肥') || targetStr.includes('馬桶')) {
    return { type: 'septic', vectorKey: 'septic', label: '化糞池/馬桶', gwpFactor: 1.5 };
  }
  if (targetStr.includes('消防') || targetStr.includes('滅火') || targetStr.includes('乾粉')) {
    return { type: 'fire', vectorKey: 'fire', label: '消防設施', gwpFactor: 1.0 };
  }
  if (targetStr.includes('機') || targetStr.includes('機台') || targetStr.includes('設備')) {
    return { type: 'machine', vectorKey: 'machine', label: '工業機台', gwpFactor: 1.8 };
  }
  if (targetStr.includes('電') || targetStr.includes('照明') || targetStr.includes('外購')) {
    return { type: 'electricity', vectorKey: 'electricity', label: '電力設施', gwpFactor: 0.495 };
  }
  if (targetStr.includes('瓦斯') || targetStr.includes('天然氣') || targetStr.includes('lpg')) {
    return { type: 'gas', vectorKey: 'gas', label: '天然氣/瓦斯', gwpFactor: 2.998 };
  }
  return { ...DEFAULT_CONFIG };
}

function getScope(energy) {
  if (!energy) return '範疇一';
  if (energy.includes('電力') || energy.includes('電錶')) return '範疇二 (能源間接)';
  return '範疇一 (直接排放)';
}

function estimateCO2(device) {
  if (device.isUpgraded) return 0.2; // 替代升級後低碳
  const type = device.config.type;
  const factor = EMISSION_FACTOR[type] || 1.0;
  const use = { electricity: 2000, car: 1000, truck: 1500, generator: 500, ac: 0.05, fridge: 0.05, gas: 200, septic: 10, other: 100 }[type] || 100;
  return factor * use * device.quantity / 1000;
}

function getGWPWarning(device) {
  if (device.isUpgraded) return null;
  const cfg = device.config;
  if (!cfg.gwpWarning) return null;
  const ref = cfg.gwpWarning.refrigerant;
  for (const [key, data] of Object.entries(GWP_DB)) {
    if (ref && ref.toLowerCase().includes(key.toLowerCase())) return { ...data, refrigerant: key };
  }
  return null;
}

// =============================================
// 6. Canvas 繪製（場景皮膚）
// =============================================
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width, h = canvas.height;

  if (gameState.floorPlanImg) {
    const size = gameState.pixelSize;
    if (size <= 2) {
      ctx.drawImage(gameState.floorPlanImg, 0, 0, w, h);
    } else {
      const offW = Math.floor(w / size);
      const offH = Math.floor(h / size);
      const offCanvas = document.createElement('canvas');
      offCanvas.width = offW; offCanvas.height = offH;
      const offCtx = offCanvas.getContext('2d');
      offCtx.drawImage(gameState.floorPlanImg, 0, 0, offW, offH);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offCanvas, 0, 0, w, h);
    }
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(0, 0, w, h);
  } else {
    // 繪製地面皮膚
    if (gameState.currentSkin === 'market') {
      // 🛒 水果市場：雙色綠白瓷磚
      const tileSize = 50;
      for (let x = 0; x < w; x += tileSize) {
        for (let y = 0; y < h; y += tileSize) {
          const isAlt = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
          ctx.fillStyle = isAlt ? '#064e3b' : '#047857';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = '#065f46';
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }
    } else if (gameState.currentSkin === 'factory') {
      // 🏭 綠色工廠：灰色地坪 + 黃黑安全斜紋邊界
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    } else {
      // 🏢 商業門市：暖色木紋質感
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#292524';
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    }
  }
}

// =============================================
// 7. 動態樓層/區域分頁與向量精靈圖渲染
// =============================================
function renderLocationTabs() {
  const container = document.getElementById('locationTabsContainer');
  if (!container) return;

  const locSet = new Set(gameState.customLocations);
  gameState.devices.forEach(d => {
    if (d.location) locSet.add(d.location);
  });

  const locations = Array.from(locSet);
  container.innerHTML = '';

  // 1. 全部區域頁籤
  const allBtn = document.createElement('button');
  const isAllActive = gameState.activeLocation === 'all';
  allBtn.className = `px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
    isAllActive
      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
  }`;
  allBtn.innerHTML = `🌐 全部區域 (${gameState.devices.length})`;
  allBtn.onclick = () => selectLocationTab('all');
  container.appendChild(allBtn);

  // 2. 各獨立區域/樓層頁籤
  locations.forEach(loc => {
    const count = gameState.devices.filter(d => d.location === loc).length;
    const isActive = gameState.activeLocation === loc;
    const btn = document.createElement('button');
    btn.className = `px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
      isActive
        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
    }`;
    btn.innerHTML = `📍 ${loc} (${count})`;
    btn.onclick = () => selectLocationTab(loc);
    container.appendChild(btn);
  });
}

function selectLocationTab(locName) {
  gameState.activeLocation = locName;
  renderAll();
  showToast(locName === 'all' ? '🌐 已切換至【全部區域】視圖' : `📍 已切換至【${locName}】分頁`);
}

function addNewCustomLocation() {
  const newLoc = prompt('請輸入新增的區域或樓層名稱（例如：3F 研發中心、B1 停車場、戶外太陽能區）：');
  if (!newLoc || !newLoc.trim()) return;

  const cleanLoc = newLoc.trim();
  if (!gameState.customLocations.includes(cleanLoc)) {
    gameState.customLocations.push(cleanLoc);
  }
  selectLocationTab(cleanLoc);
  showToast(`✨ 成功新增【${cleanLoc}】自訂區域！您可以新增設備並歸類至此分頁。`);
}

function renderSprites() {
  spritesLayer.innerHTML = '';
  const visibleDevices = gameState.devices.filter(
    d => gameState.activeLocation === 'all' || d.location === gameState.activeLocation
  );

  visibleDevices.forEach(device => {
    const el = createSpriteElement(device);
    spritesLayer.appendChild(el);
  });
}

function createSpriteElement(device) {
  const warning = getGWPWarning(device);
  const div = document.createElement('div');
  div.className = `device-sprite sprite-${device.config.type}${warning ? ' warning-device' : ''}${device.isUpgraded ? ' upgraded-device' : ''}`;
  div.dataset.deviceId = device.id;
  div.style.left = device.x + 'px';
  div.style.top = device.y + 'px';

  // 警告徽章
  if (warning) {
    const badge = document.createElement('span');
    badge.className = 'sprite-warning-badge';
    badge.textContent = '!';
    div.appendChild(badge);
  }

  // 模擬標籤
  if (device.isSim) {
    const simBadge = document.createElement('span');
    simBadge.className = 'sim-badge';
    simBadge.textContent = 'SIM';
    div.appendChild(simBadge);
  }

  // 向量 Icon 容器
  const iconBox = document.createElement('div');
  iconBox.className = 'vector-icon-box';
  const svgKey = device.config.vectorKey || 'other';
  iconBox.innerHTML = VECTOR_SVG_SPRITES[svgKey] || VECTOR_SVG_SPRITES.other;
  div.appendChild(iconBox);

  // Label
  const label = document.createElement('span');
  label.className = `sprite-label${warning ? ' warning-label' : ''}`;
  label.textContent = device.name.length > 9 ? device.name.slice(0, 9) + '…' : device.name;
  div.appendChild(label);

  // Events
  div.addEventListener('click', (e) => { e.stopPropagation(); showDeviceModal(device.id); });
  div.addEventListener('mousedown', (e) => startDrag(e, div, device));
  div.addEventListener('touchstart', (e) => startTouchDrag(e, div, device), { passive: false });

  return div;
}

// =============================================
// 行動裝置 Drawer 滑出式選單切換
// =============================================
function toggleMobileDrawer(side) {
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.getElementById('rightPanel');
  const backdrop = document.getElementById('mobileDrawerBackdrop');

  if (side === 'left') {
    const isOpen = leftPanel.classList.contains('drawer-open');
    closeMobileDrawers();
    if (!isOpen) {
      leftPanel.classList.add('drawer-open');
      backdrop.classList.remove('hidden');
    }
  } else if (side === 'right') {
    const isOpen = rightPanel.classList.contains('drawer-open');
    closeMobileDrawers();
    if (!isOpen) {
      rightPanel.classList.add('drawer-open');
      backdrop.classList.remove('hidden');
    }
  }
}

function toggleMobileControlPanel() {
  const panel = document.getElementById('mobileControlPanel');
  if (panel) {
    panel.classList.toggle('hidden');
  }
}

function closeMobileDrawers() {
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.getElementById('rightPanel');
  const backdrop = document.getElementById('mobileDrawerBackdrop');

  if (leftPanel) leftPanel.classList.remove('drawer-open');
  if (rightPanel) rightPanel.classList.remove('drawer-open');
  if (backdrop) backdrop.classList.add('hidden');
}

// 自然粒子生成引擎
function startParticleEngine() {
  if (particleInterval) clearInterval(particleInterval);
  particleInterval = setInterval(() => {
    gameState.devices.forEach(device => {
      const type = device.config.type;
      const el = document.querySelector(`[data-device-id="${device.id}"] .vector-icon-box`);
      if (!el) return;

      if (type === 'ac' || type === 'fridge') {
        // 冷氣微風冰霧粒子
        const p = document.createElement('div');
        p.className = 'particle-mist';
        p.style.left = (15 + Math.random() * 30) + 'px';
        p.style.top = (35 + Math.random() * 10) + 'px';
        el.appendChild(p);
        setTimeout(() => p.remove(), 2000);
      } else if (type === 'car' || type === 'truck' || type === 'generator') {
        // 車輛/發電機排煙粒子
        const p = document.createElement('div');
        p.className = 'particle-smoke';
        p.style.right = (5 + Math.random() * 10) + 'px';
        p.style.top = (10 + Math.random() * 15) + 'px';
        el.appendChild(p);
        setTimeout(() => p.remove(), 1800);
      }
    });
  }, 800);
}

// =============================================
// 8. 拖曳 (滑鼠 & 行動裝置觸控)
// =============================================
function startDrag(e, el, device) {
  e.preventDefault();
  isDragging = true;
  dragTarget = { el, device };
  const rect = el.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;

  el.classList.add('dragging');
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
}

function onDragMove(e) {
  if (!isDragging || !dragTarget) return;
  const layerRect = spritesLayer.getBoundingClientRect();
  let x = e.clientX - layerRect.left - dragOffsetX;
  let y = e.clientY - layerRect.top - dragOffsetY;
  x = Math.max(0, Math.min(x, spritesLayer.clientWidth - 70));
  y = Math.max(0, Math.min(y, spritesLayer.clientHeight - 70));
  dragTarget.el.style.left = x + 'px';
  dragTarget.el.style.top = y + 'px';
  dragTarget.device.x = x;
  dragTarget.device.y = y;
}

function onDragEnd() {
  if (!isDragging) return;
  isDragging = false;
  if (dragTarget) dragTarget.el.classList.remove('dragging');
  dragTarget = null;
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
}

function startTouchDrag(e, el, device) {
  if (e.touches.length !== 1) return;
  isDragging = true;
  dragTarget = { el, device };
  const touch = e.touches[0];
  const rect = el.getBoundingClientRect();
  dragOffsetX = touch.clientX - rect.left;
  dragOffsetY = touch.clientY - rect.top;

  el.classList.add('dragging');
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd);
}

function onTouchMove(e) {
  if (!isDragging || !dragTarget || e.touches.length !== 1) return;
  e.preventDefault();
  const touch = e.touches[0];
  const layerRect = spritesLayer.getBoundingClientRect();
  let x = touch.clientX - layerRect.left - dragOffsetX;
  let y = touch.clientY - layerRect.top - dragOffsetY;
  x = Math.max(0, Math.min(x, spritesLayer.clientWidth - 70));
  y = Math.max(0, Math.min(y, spritesLayer.clientHeight - 70));
  dragTarget.el.style.left = x + 'px';
  dragTarget.el.style.top = y + 'px';
  dragTarget.device.x = x;
  dragTarget.device.y = y;
}

function onTouchEnd() {
  if (!isDragging) return;
  isDragging = false;
  if (dragTarget) dragTarget.el.classList.remove('dragging');
  dragTarget = null;
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
}

// =============================================
// 9. 💬 碳盤顧問「小碳 (Eco-Pal)」RPG 對話框系統
// =============================================
function showConsultantModal(device, isNewSim = true) {
  const modal = document.getElementById('consultantModal');
  const msgEl = document.getElementById('consultantMessage');
  const avatarEl = document.getElementById('consultantAvatar');
  const specsEl = document.getElementById('consultantSpecs');
  const actionsEl = document.getElementById('consultantActions');

  const warning = getGWPWarning(device);
  const co2 = estimateCO2(device);

  // 顧問動態表情與頭像
  if (warning) {
    avatarEl.textContent = '🙀'; // 驚訝表情
    avatarEl.className = 'avatar-box w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-4xl shrink-0 shadow-lg animate-bounce';
  } else {
    avatarEl.textContent = '🍃'; // 友善表情
    avatarEl.className = 'avatar-box w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl shrink-0 shadow-lg animate-bounce';
  }

  // RPG 打字機訊息
  let fullText = '';
  if (isNewSim) {
    if (warning) {
      fullText = `⚠️ 警告！您剛擬新增的『${device.name}』採用了高危害冷媒 ${warning.refrigerant}，GWP 高達 ${warning.gwp.toLocaleString()}！這會使全廠年排放額外增加 ${co2.toFixed(2)} tCO₂e！小碳建議您採納低碳替代方案！`;
    } else {
      fullText = `🌱 報告！您擬新增的『${device.name}』已完成碳評估，預估年碳排放當量為 ${co2.toFixed(2)} tCO₂e。小碳已為您同步記錄於模擬清單！`;
    }
  }

  // 渲染打字機效果
  msgEl.textContent = '';
  let idx = 0;
  const timer = setInterval(() => {
    if (idx < fullText.length) {
      msgEl.textContent += fullText[idx];
      idx++;
    } else {
      clearInterval(timer);
    }
  }, 20);

  // 預覽卡片
  specsEl.innerHTML = `
    <div class="modal-stat-chip">
      <span class="label">設備名稱</span>
      <span class="value text-emerald-400 text-xs truncate">${device.name}</span>
    </div>
    <div class="modal-stat-chip">
      <span class="label">預估年碳排</span>
      <span class="value text-rose-400 text-xs">${co2.toFixed(2)} t</span>
    </div>
    <div class="modal-stat-chip">
      <span class="label">排放範疇</span>
      <span class="value text-amber-400 text-xs">${device.scope}</span>
    </div>
  `;

  // 互動按鈕
  if (warning) {
    const altName = warning.alternatives[0]?.name || '環保冷媒';
    actionsEl.innerHTML = `
      <button onclick="adoptGreenAlternative('${device.id}')" class="pixel-btn-green flex-1 py-3 text-xs flex items-center justify-center gap-1 shadow-lg">
        <i class="fa-solid fa-leaf"></i> 採納顧問建議：更換為 ${altName}
      </button>
      <button onclick="closeConsultantModal()" class="pixel-btn-back py-3 px-4 text-xs">
        維持原設定
      </button>
    `;
  } else {
    actionsEl.innerHTML = `
      <button onclick="closeConsultantModal()" class="pixel-btn-green w-full py-3 text-xs">
        收到，謝謝小碳！
      </button>
    `;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeConsultantModal() {
  document.getElementById('consultantModal').classList.add('hidden');
}

// 採納綠色替代方案（星光升級特效）
function adoptGreenAlternative(deviceId) {
  const device = gameState.devices.find(d => d.id === deviceId);
  if (!device) return;

  device.isUpgraded = true;
  gameState.totalXP += 100;
  closeConsultantModal();

  renderAll();
  showToast(`✨ 成功採納顧問建議！設備已升級為低碳環保機型，獲得 +100 XP！`);
}

// =============================================
// 10. 新增模擬設備
// =============================================
function addSimDevice() {
  const name = document.getElementById('simDeviceName').value.trim();
  const type = document.getElementById('simDeviceType').value;

  if (!name || !type) {
    alert('請輸入設備名稱並選擇類型！');
    return;
  }

  gameState.simDeviceCounter++;
  const newDevice = {
    id: `sim_${Date.now()}`,
    name: name,
    energy: type,
    config: getDeviceConfig(type),
    quantity: 1,
    location: '模擬新增',
    scope: getScope(type),
    x: 60 + Math.random() * (spritesLayer.clientWidth - 160),
    y: 60 + Math.random() * (spritesLayer.clientHeight - 160),
    isSim: true,
    isUpgraded: false
  };

  gameState.devices.push(newDevice);
  document.getElementById('simDeviceName').value = '';
  document.getElementById('simDeviceType').value = '';

  renderAll();
  showConsultantModal(newDevice, true);
}

// =============================================
// 11. 皮膚切換
// =============================================
function changeSkin(skinName) {
  gameState.currentSkin = skinName;
  document.body.className = `game-bg min-h-screen text-white overflow-x-hidden skin-${skinName}`;
  document.querySelectorAll('.skin-btn').forEach(btn => btn.classList.remove('active'));
  if (skinName === 'market') document.getElementById('skinBtnMarket').classList.add('active');
  if (skinName === 'factory') document.getElementById('skinBtnFactory').classList.add('active');
  if (skinName === 'office') document.getElementById('skinBtnOffice').classList.add('active');
  redrawCanvas();
}

// =============================================
// 12. 統計與警告
// =============================================
function renderEmissionStats() {
  let scope1 = 0, scope2 = 0;
  gameState.devices.forEach(d => {
    const co2 = estimateCO2(d);
    if (d.scope && d.scope.includes('二')) scope2 += co2;
    else scope1 += co2;
  });

  const total = scope1 + scope2;
  document.getElementById('scope1Val').textContent = scope1.toFixed(2) + ' t';
  document.getElementById('scope2Val').textContent = scope2.toFixed(2) + ' t';
  document.getElementById('totalCO2').textContent = total.toFixed(2) + ' t';
  document.getElementById('statCO2').textContent = total.toFixed(2) + ' tCO₂e';
  document.getElementById('statDevices').textContent = gameState.devices.length;

  const xp = gameState.devices.length * 50 + gameState.totalXP;
  document.getElementById('statXP').textContent = xp;
  document.getElementById('statLevel').textContent = `Lv.${Math.floor(xp / 200) + 1}`;

  renderForecast(total);
}

function renderForecast(currentTotal) {
  const panel = document.getElementById('forecastPanel');
  panel.innerHTML = [1, 2, 3, 4, 5].map(y => `
    <div class="stat-row">
      <span class="text-slate-400">${y} 年後累積</span>
      <span class="text-rose-400 font-bold font-mono">${(currentTotal * y).toFixed(2)} tCO₂e</span>
    </div>
  `).join('');
}

function renderDeviceList() {
  const list = document.getElementById('deviceList');
  if (!list) return;
  list.innerHTML = '';

  const visibleDevices = gameState.devices.filter(
    d => gameState.activeLocation === 'all' || d.location === gameState.activeLocation
  );

  if (visibleDevices.length === 0) {
    list.innerHTML = '<p class="text-slate-500 text-xs text-center py-4">此分頁尚無登錄設備</p>';
    return;
  }

  visibleDevices.forEach(device => {
    const warning = getGWPWarning(device);
    const card = document.createElement('div');
    card.className = `device-list-card${device.isSim ? ' sim-card' : ''}`;
    card.onclick = () => showDeviceModal(device.id);
    const svgKey = device.config.vectorKey || 'other';

    card.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
        ${VECTOR_SVG_SPRITES[svgKey]}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-slate-200 truncate font-bold">${device.name}</div>
        <div class="text-slate-400 text-[10px] truncate">${device.energy || '未設定'} · ${device.location}</div>
      </div>
      ${warning ? '<span class="text-rose-400 font-bold text-sm shrink-0">!</span>' : ''}
      ${device.isUpgraded ? '<span class="text-emerald-400 text-xs shrink-0">✨</span>' : ''}
    `;
    list.appendChild(card);
  });
}

function renderWarnings() {
  const list = document.getElementById('warningList');
  list.innerHTML = '';
  const warnings = gameState.devices.filter(d => getGWPWarning(d));
  if (warnings.length === 0) {
    list.innerHTML = '<p class="text-slate-500 text-xs text-center py-4" id="noWarnings">✅ 尚未偵測到高排放設備</p>';
    return;
  }

  warnings.forEach(device => {
    const w = getGWPWarning(device);
    const card = document.createElement('div');
    card.className = 'bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-xs space-y-1';
    card.onclick = () => showDeviceModal(device.id);
    card.innerHTML = `
      <div class="font-bold text-rose-300">⚠️ ${device.name}</div>
      <div class="text-slate-300 text-[11px]">使用高危害冷媒 ${w.refrigerant}，GWP = <strong class="text-rose-400">${w.gwp}</strong></div>
      <button onclick="event.stopPropagation(); showConsultantModal(gameState.devices.find(d=>d.id==='${device.id}'), true)" class="text-emerald-400 hover:underline text-[10px] font-bold">
        呼叫顧問查看降碳方案 →
      </button>
    `;
    list.appendChild(card);
  });
}

// =============================================
// 13. 詳情與替代品 Modal
// =============================================
function showDeviceModal(deviceId) {
  const device = gameState.devices.find(d => d.id === deviceId);
  if (!device) return;

  gameState.selectedDevice = device;
  const warning = getGWPWarning(device);
  const co2 = estimateCO2(device);
  const svgKey = device.config.vectorKey || 'other';

  document.getElementById('modalVectorIcon').innerHTML = VECTOR_SVG_SPRITES[svgKey];
  document.getElementById('modalName').textContent = device.name;
  document.getElementById('modalType').textContent = `${device.energy || '未設定'} · ${device.scope}`;

  document.getElementById('modalStats').innerHTML = `
    <div class="modal-stat-chip">
      <span class="label">設備數量</span>
      <span class="value text-cyan-400">${device.quantity}</span>
    </div>
    <div class="modal-stat-chip">
      <span class="label">估算年碳排</span>
      <span class="value text-rose-400 font-mono">${co2.toFixed(2)} t</span>
    </div>
    <div class="modal-stat-chip">
      <span class="label">所在位置</span>
      <span class="value text-emerald-400 text-xs truncate">${device.location}</span>
    </div>
    <div class="modal-stat-chip">
      <span class="label">排放範疇</span>
      <span class="value text-amber-400 text-xs truncate">${device.scope}</span>
    </div>
  `;

  const warnEl = document.getElementById('modalWarning');
  const forecastEl = document.getElementById('modalForecast');
  const findAltBtn = document.getElementById('findAltBtn');

  if (warning) {
    warnEl.classList.remove('hidden');
    document.getElementById('modalWarningText').textContent = warning.note;
    document.getElementById('modalAlternatives').innerHTML = warning.alternatives.map(alt => `
      <div class="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2 text-xs">
        <div class="flex justify-between items-center mb-1">
          <span class="text-emerald-400 font-bold">${alt.name}</span>
          <span class="text-emerald-300 font-mono">GWP: ${alt.gwp} (↓${alt.saving})</span>
        </div>
        <div class="text-amber-300 text-[11px] mb-1">💰 參考價格：${alt.price}</div>
        <div class="text-slate-300 text-[11px]">${alt.note}</div>
      </div>
    `).join('');
    forecastEl.classList.remove('hidden');
    findAltBtn.classList.remove('hidden');
  } else {
    warnEl.classList.add('hidden');
    forecastEl.classList.add('hidden');
    findAltBtn.classList.add('hidden');
  }

  const modal = document.getElementById('deviceModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal() {
  document.getElementById('deviceModal').classList.add('hidden');
}

function openAlternativeSearch() {
  closeModal();
  if (gameState.selectedDevice) {
    showConsultantModal(gameState.selectedDevice, true);
  }
}

function closeAltModal() {
  document.getElementById('altModal').classList.add('hidden');
}

// 上傳與像素化底圖
function handleFloorPlanUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      gameState.floorPlanImg = img;
      localStorage.setItem('cfv_floor_plan', e.target.result);
      document.getElementById('defaultMapOverlay').style.display = 'none';
      redrawCanvas();
      showToast('✅ 場地圖已成功上傳並套用！');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function applyPixelEffect() {
  gameState.pixelSize = parseInt(document.getElementById('pixelSlider').value);
  document.getElementById('pixelVal').textContent = gameState.pixelSize + 'px';
  redrawCanvas();
}

function autoArrangeDevices() {
  const cols = Math.ceil(Math.sqrt(gameState.devices.length));
  const colW = (spritesLayer.clientWidth - 120) / cols;
  gameState.devices.forEach((device, i) => {
    device.x = 60 + (i % cols) * colW;
    device.y = 60 + Math.floor(i / cols) * 130;
  });
  renderSprites();
  showToast('🎯 設備已自動排列對齊！');
}

function toggleWarnings() {
  gameState.warningsVisible = !gameState.warningsVisible;
  const btn = document.getElementById('warningToggleBtn');
  btn.textContent = gameState.warningsVisible ? '⚠️ 隱藏警告' : '⚠️ 顯示警告';
  renderSprites();
}

function goBack() {
  window.location.href = 'index.html';
}

function renderAll() {
  renderLocationTabs();
  redrawCanvas();
  renderSprites();
  renderDeviceList();
  renderWarnings();
  renderEmissionStats();
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: #10b981; color: #022c22; padding: 10px 24px; border-radius: 14px;
    font-size: 13px; font-weight: 900; border: 2px solid #34d399; z-index: 9999;
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.5); transition: opacity 0.4s;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 2400);
}

function startXPCounter() {}

const TIPS = [
  '🌱 將 R-22/R-404A 更換為低 GWP 冷媒，可瞬間為全廠減少 60% 以上的逸散碳排！',
  '⚡ 採用智慧節能電錶監控用電，能找出非營業時間隱形耗電設備。',
  '🚚 運送車輛定期檢查胎壓與保養，可節省 5-8% 燃油碳排放。',
  '🏭 ISO 14064-1 碳盤查是邁向淨零碳中和的最佳第一步！'
];

let tipIdx = 0;
function showRandomTip() {
  const tipBox = document.getElementById('tipBox');
  if (tipBox) tipBox.textContent = TIPS[tipIdx % TIPS.length];
  tipIdx++;
  setTimeout(showRandomTip, 7000);
}

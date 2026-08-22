/* =============================================
   CFV 碳排放遊戲 - 主要邏輯
   game/game.js
   ============================================= */

'use strict';

// =============================================
// 1. 設備配置與 GWP 資料
// =============================================

const DEVICE_CONFIGS = {
  '外購電力':          { type: 'electricity', emoji: '💡', color: '#fbbf24', label: '電力設備',  gwpFactor: 0.495 },
  '車用汽油':          { type: 'car',         emoji: '🚗', color: '#f87171', label: '汽油車輛',  gwpFactor: 2.263 },
  '高級汽油':          { type: 'car',         emoji: '🚗', color: '#f87171', label: '汽油車輛',  gwpFactor: 2.263 },
  '92無鉛汽油':        { type: 'car',         emoji: '🚗', color: '#f87171', label: '汽油車輛',  gwpFactor: 2.263 },
  '95無鉛汽油':        { type: 'car',         emoji: '🚗', color: '#f87171', label: '汽油車輛',  gwpFactor: 2.263 },
  '98無鉛汽油':        { type: 'car',         emoji: '🚗', color: '#f87171', label: '汽油車輛',  gwpFactor: 2.263 },
  '車用柴油':          { type: 'truck',       emoji: '🚛', color: '#fb923c', label: '柴油車輛',  gwpFactor: 2.606 },
  '冷氣冷媒(R-410A)':  { type: 'ac',          emoji: '❄️', color: '#60a5fa', label: '冷氣(R410A)', gwpFactor: 0, gwpWarning: { refrigerant: 'R-410A', gwp: 2088 } },
  '冷藏冷媒(R-404A)':  { type: 'fridge',      emoji: '🧊', color: '#7dd3fc', label: '冷藏(R404A)', gwpFactor: 0, gwpWarning: { refrigerant: 'R-404A', gwp: 3922 } },
  '桶裝瓦斯(LPG)':     { type: 'gas',         emoji: '🔥', color: '#f97316', label: '桶裝瓦斯',  gwpFactor: 2.998 },
  '天然氣':            { type: 'gas',         emoji: '🔥', color: '#f97316', label: '天然氣',    gwpFactor: 1.879 },
  '液化天然氣':        { type: 'gas',         emoji: '🔥', color: '#f97316', label: '液化天然氣', gwpFactor: 1.879 },
  '柴油發電機組':      { type: 'generator',   emoji: '⚙️', color: '#a78bfa', label: '柴油發電機', gwpFactor: 2.606 },
  '汽油發電機組':      { type: 'generator',   emoji: '⚙️', color: '#c084fc', label: '汽油發電機', gwpFactor: 2.263 },
};

const DEFAULT_CONFIG = { type: 'other', emoji: '🏭', color: '#94a3b8', label: '其他設備', gwpFactor: 1.0 };

// GWP 警告資料庫
const GWP_DB = {
  'R-410A': {
    gwp: 2088,
    status: 'high',   // 'high' | 'critical'
    note: 'HFC 類冷媒，GWP 高達 2088，為 CO₂ 的 2088 倍',
    alternatives: [
      {
        name: 'R-32', gwp: 675, saving: '68%',
        price: '約 NT$600–900 / kg',
        note: '✅ 目前市場主流替代品，能效提升約 5-10%，需確認設備相容性'
      },
      {
        name: 'R-290 (丙烷)', gwp: 3, saving: '99.9%',
        price: '約 NT$300–500 / kg',
        note: '🌿 GWP 極低，但屬可燃冷媒，需特殊認證設備'
      }
    ]
  },
  'R-404A': {
    gwp: 3922,
    status: 'critical',
    note: '⛔ 蒙特婁議定書列管冷媒，GWP 高達 3922，歐盟已禁止販售',
    alternatives: [
      {
        name: 'R-448A', gwp: 1387, saving: '65%',
        price: '約 NT$1500–2500 / kg',
        note: '✅ 商用冷藏主流替代方案，可直接替換 R-404A 系統'
      },
      {
        name: 'R-744 (CO₂)', gwp: 1, saving: '99.97%',
        price: '約 NT$200–400 / kg',
        note: '🌿 天然冷媒，GWP 最低，但需高壓系統設備'
      }
    ]
  },
  'R-22': {
    gwp: 1810,
    status: 'critical',
    note: '⛔ HCFC 類冷媒，已列入蒙特婁議定書管制，GWP = 1810',
    alternatives: [
      {
        name: 'R-32', gwp: 675, saving: '63%',
        price: '約 NT$600–900 / kg',
        note: '✅ 建議整機汰換為 R-32 機種，每年可省電 15-20%'
      }
    ]
  }
};

// 估算排放係數（kg CO₂e per 使用數量年）
const EMISSION_FACTOR = {
  electricity: 0.495,   // kWh → 0.495 kg CO₂e
  car: 2.263,           // L汽油 → 2.263 kg CO₂e
  truck: 2.606,         // L柴油 → 2.606 kg CO₂e
  generator: 2.606,
  gas: 2.998,
  ac: 2.088,            // kg冷媒洩漏 × GWP / 1000 (約估)
  fridge: 3.922,
  other: 1.0
};

// =============================================
// 2. 全域狀態
// =============================================
let gameState = {
  devices: [],        // { id, name, energy, config, x, y, quantity, isSim }
  floorPlanImg: null, // Image object
  floorPlanBase64: null,
  pixelSize: 6,
  warningsVisible: true,
  selectedDevice: null,
  totalXP: 0,
  companyName: '我的工廠',
  simDeviceCounter: 0
};

let canvas, ctx, spritesLayer, isDragging = false;
let dragTarget = null, dragOffsetX = 0, dragOffsetY = 0;

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
  showRandomTip();
});

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

// =============================================
// 4. 資料載入（從 localStorage 讀取主應用資料）
// =============================================
function loadGameData() {
  // 讀取公司資訊
  try {
    const companyRaw = localStorage.getItem('cfv_company_info');
    if (companyRaw) {
      const company = JSON.parse(companyRaw);
      gameState.companyName = company.name || '我的工廠';
      document.getElementById('gameCompanyName').textContent = gameState.companyName;
    }
  } catch(e) { /* ignore */ }

  // 讀取排放源設備清單
  try {
    const devicesRaw = localStorage.getItem('cfv_emission_sources');
    if (devicesRaw) {
      const sources = JSON.parse(devicesRaw);
      gameState.devices = sources.map((s, i) => {
        const energy = s.energy || s.material || '';
        const config = getDeviceConfig(energy);
        return {
          id: `dev_${i}`,
          name: s.name || s.equipName || `設備 ${i+1}`,
          energy: energy,
          config: config,
          quantity: parseInt(s.quantity) || 1,
          location: s.location || '',
          scope: s.scope || getScope(energy),
          x: 80 + (i % 5) * 120,
          y: 80 + Math.floor(i / 5) * 120,
          isSim: false
        };
      });
    }
  } catch(e) { /* ignore */ }

  // 若沒有 localStorage 資料，使用展示用 demo 資料
  if (gameState.devices.length === 0) {
    loadDemoDevices();
  }

  // 讀取場地圖
  try {
    const imgData = localStorage.getItem('cfv_floor_plan');
    if (imgData) {
      const img = new Image();
      img.onload = () => {
        gameState.floorPlanImg = img;
        document.getElementById('defaultMapOverlay').style.display = 'none';
        redrawCanvas();
      };
      img.src = imgData;
      gameState.floorPlanBase64 = imgData;
    }
  } catch(e) { /* ignore */ }

  renderAll();
}

function loadDemoDevices() {
  const demoSources = [
    { id: 'dev_0', name: '營業用冷藏展示櫃',    energy: '外購電力',         quantity: 1, location: '攤位本區', isSim: false },
    { id: 'dev_1', name: '門市冷氣 (R-410A)',    energy: '冷氣冷媒(R-410A)', quantity: 1, location: '攤位本區', isSim: false },
    { id: 'dev_2', name: '批發載貨小貨車',        energy: '車用柴油',         quantity: 1, location: '對外運輸', isSim: false },
    { id: 'dev_3', name: '攤位照明探照燈',        energy: '外購電力',         quantity: 2, location: '攤位本區', isSim: false },
  ];
  gameState.devices = demoSources.map((s, i) => ({
    ...s,
    config: getDeviceConfig(s.energy),
    scope: getScope(s.energy),
    x: 80 + (i % 4) * 130,
    y: 100 + Math.floor(i / 4) * 130,
  }));
}

// =============================================
// 5. 工具函式
// =============================================
function getDeviceConfig(energy) {
  for (const [key, cfg] of Object.entries(DEVICE_CONFIGS)) {
    if (energy && (energy.includes(key) || key.includes(energy))) return cfg;
  }
  return { ...DEFAULT_CONFIG };
}

function getScope(energy) {
  if (!energy) return '範疇一';
  if (energy.includes('電力') || energy.includes('電')) return '範疇二 (能源間接)';
  return '範疇一 (直接排放)';
}

function estimateCO2(device) {
  const type = device.config.type;
  const factor = EMISSION_FACTOR[type] || 1.0;
  // 簡易估算：數量 × 係數 × 年使用量假設
  const annualUse = {
    electricity: 2000,  // kWh/年
    car: 1000,          // L/年
    truck: 1500,        // L/年
    generator: 500,     // L/年
    ac: 0.05,           // kg冷媒洩漏/年 (5%)
    fridge: 0.05,
    gas: 200,           // L/年
    other: 100
  };
  const use = annualUse[type] || 100;
  return factor * use * device.quantity / 1000; // tCO₂e/年
}

function getGWPWarning(device) {
  const cfg = device.config;
  if (!cfg.gwpWarning) return null;
  const ref = cfg.gwpWarning.refrigerant;
  for (const [key, data] of Object.entries(GWP_DB)) {
    if (ref && ref.toLowerCase().includes(key.toLowerCase())) return { ...data, refrigerant: key };
  }
  return null;
}

// =============================================
// 6. Canvas 渲染
// =============================================
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState.floorPlanImg) {
    // Draw floor plan with pixel effect
    const size = gameState.pixelSize;
    const w = canvas.width, h = canvas.height;

    if (size <= 2) {
      ctx.drawImage(gameState.floorPlanImg, 0, 0, w, h);
    } else {
      // Pixelation: draw small → scale up
      const offW = Math.floor(w / size);
      const offH = Math.floor(h / size);
      const offCanvas = document.createElement('canvas');
      offCanvas.width = offW; offCanvas.height = offH;
      const offCtx = offCanvas.getContext('2d');
      offCtx.drawImage(gameState.floorPlanImg, 0, 0, offW, offH);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offCanvas, 0, 0, w, h);
    }

    // Overlay green tint for game feel
    ctx.fillStyle = 'rgba(0, 20, 5, 0.45)';
    ctx.fillRect(0, 0, w, h);

    // Scanlines effect
    ctx.fillStyle = 'rgba(0,0,0,0)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, y, w, 2);
    }

    document.getElementById('defaultMapOverlay').style.display = 'none';
  } else {
    // Default dark grid background
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }
}

// =============================================
// 7. Sprite 渲染（HTML 元素）
// =============================================
function renderSprites() {
  spritesLayer.innerHTML = '';
  gameState.devices.forEach(device => {
    const el = createSpriteElement(device);
    spritesLayer.appendChild(el);
  });
}

function createSpriteElement(device) {
  const warning = getGWPWarning(device);
  const div = document.createElement('div');
  div.className = `device-sprite sprite-${device.config.type}${warning ? ' warning-device' : ''}`;
  div.dataset.deviceId = device.id;
  div.style.left = device.x + 'px';
  div.style.top = device.y + 'px';

  // Warning badge
  if (warning) {
    const badge = document.createElement('span');
    badge.className = 'sprite-warning-badge';
    badge.textContent = '⚠️';
    div.appendChild(badge);
  }

  // Sim badge
  if (device.isSim) {
    const simBadge = document.createElement('span');
    simBadge.className = 'sim-badge';
    simBadge.textContent = 'SIM';
    div.appendChild(simBadge);
  }

  // Emoji
  const emoji = document.createElement('span');
  emoji.className = 'sprite-emoji';
  emoji.textContent = device.config.emoji;
  div.appendChild(emoji);

  // Label
  const label = document.createElement('span');
  label.className = `sprite-label${warning ? ' warning-label' : ''}`;
  label.textContent = device.name.length > 8 ? device.name.slice(0, 8) + '…' : device.name;
  div.appendChild(label);

  // Events
  div.addEventListener('click', (e) => { e.stopPropagation(); showDeviceModal(device.id); });
  div.addEventListener('mousedown', (e) => startDrag(e, div, device));

  return div;
}

// =============================================
// 8. 拖曳功能
// =============================================
function startDrag(e, el, device) {
  e.preventDefault();
  isDragging = true;
  dragTarget = { el, device };

  const rect = el.getBoundingClientRect();
  const layerRect = spritesLayer.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;

  el.classList.add('dragging');
  el.style.zIndex = '100';

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
}

function onDragMove(e) {
  if (!isDragging || !dragTarget) return;
  const layerRect = spritesLayer.getBoundingClientRect();
  let x = e.clientX - layerRect.left - dragOffsetX;
  let y = e.clientY - layerRect.top - dragOffsetY;

  // Clamp within bounds
  x = Math.max(0, Math.min(x, spritesLayer.clientWidth - 60));
  y = Math.max(0, Math.min(y, spritesLayer.clientHeight - 60));

  dragTarget.el.style.left = x + 'px';
  dragTarget.el.style.top = y + 'px';
  dragTarget.device.x = x;
  dragTarget.device.y = y;
}

function onDragEnd(e) {
  if (!isDragging) return;
  isDragging = false;
  if (dragTarget) {
    dragTarget.el.classList.remove('dragging');
    dragTarget.el.style.zIndex = '10';
  }
  dragTarget = null;
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
}

// =============================================
// 9. 左側 Device List 渲染
// =============================================
function renderDeviceList() {
  const list = document.getElementById('deviceList');
  list.innerHTML = '';

  if (gameState.devices.length === 0) {
    list.innerHTML = '<p class="text-slate-500 text-xs text-center py-3">尚無設備資料</p>';
    return;
  }

  gameState.devices.forEach(device => {
    const warning = getGWPWarning(device);
    const card = document.createElement('div');
    card.className = `device-list-card${device.isSim ? ' sim-card' : ''}`;
    card.onclick = () => showDeviceModal(device.id);

    card.innerHTML = `
      <span class="text-xl">${device.config.emoji}</span>
      <div class="flex-1 min-w-0">
        <div class="text-slate-200 truncate font-semibold">${device.name}</div>
        <div class="text-slate-500 truncate">${device.energy || '未知類型'}</div>
      </div>
      ${warning ? '<span class="text-red-400 text-base shrink-0">⚠️</span>' : ''}
      ${device.isSim ? '<span class="text-amber-400 text-[9px] font-bold shrink-0">SIM</span>' : ''}
    `;
    list.appendChild(card);
  });
}

// =============================================
// 10. 右側警告列表渲染
// =============================================
function renderWarnings() {
  const list = document.getElementById('warningList');
  list.innerHTML = '';

  const warnings = gameState.devices.filter(d => getGWPWarning(d));
  if (warnings.length === 0) {
    list.innerHTML = '<p class="text-slate-500 text-xs text-center py-4" id="noWarnings">✅ 尚未偵測到高排放設備</p>';
    return;
  }

  document.getElementById('noWarnings')?.remove();
  warnings.forEach(device => {
    const w = getGWPWarning(device);
    const card = document.createElement('div');
    card.className = 'warning-card';
    card.onclick = () => showDeviceModal(device.id);
    const statusEmoji = w.status === 'critical' ? '🚨' : '⚠️';
    card.innerHTML = `
      <h4>${statusEmoji} ${device.name}</h4>
      <p>冷媒 ${w.refrigerant}，GWP = <strong class="text-red-400">${w.gwp.toLocaleString()}</strong></p>
      <p style="font-size:10px; color:#64748b;">建議替換 → ${w.alternatives[0]?.name || '請洽詢專業廠商'}</p>
      <button class="text-emerald-400 text-[10px] hover:underline" onclick="event.stopPropagation(); showDeviceModal('${device.id}')">查看替代方案 →</button>
    `;
    list.appendChild(card);
  });
}

// =============================================
// 11. 排放量統計
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

  // XP calculation
  const xp = Math.floor(gameState.devices.length * 50 + gameState.totalXP);
  document.getElementById('statXP').textContent = xp;
  const level = Math.floor(xp / 200) + 1;
  document.getElementById('statLevel').textContent = `Lv.${level}`;

  // 5-year forecast
  renderForecast(total);
}

function renderForecast(currentTotal) {
  const panel = document.getElementById('forecastPanel');
  const years = [1, 2, 3, 4, 5];
  panel.innerHTML = years.map(y => {
    const projected = (currentTotal * y).toFixed(2);
    return `<div class="forecast-bar">
      <span class="text-slate-400">${y} 年後</span>
      <span class="text-red-400 font-bold">${projected} tCO₂e</span>
    </div>`;
  }).join('');
}

// =============================================
// 12. 設備資訊 Modal
// =============================================
function showDeviceModal(deviceId) {
  const device = gameState.devices.find(d => d.id === deviceId);
  if (!device) return;

  gameState.selectedDevice = device;
  const warning = getGWPWarning(device);
  const co2 = estimateCO2(device);

  document.getElementById('modalEmoji').textContent = device.config.emoji;
  document.getElementById('modalName').textContent = device.name;
  document.getElementById('modalType').textContent = `${device.energy || '未知類型'} · ${device.scope || '範疇一'}`;

  // Stats grid
  const statsEl = document.getElementById('modalStats');
  statsEl.innerHTML = `
    <div class="modal-stat-chip">
      <span class="label">設備數量</span>
      <span class="value text-cyan-400">${device.quantity}</span>
    </div>
    <div class="modal-stat-chip">
      <span class="label">估算年排放</span>
      <span class="value text-red-400">${co2.toFixed(2)} t</span>
    </div>
    <div class="modal-stat-chip">
      <span class="label">所屬位置</span>
      <span class="value text-emerald-400 text-sm">${device.location || '未設定'}</span>
    </div>
    <div class="modal-stat-chip">
      <span class="label">排放範疇</span>
      <span class="value text-amber-400 text-sm">${device.scope || '範疇一'}</span>
    </div>
  `;

  // GWP Warning
  const warnEl = document.getElementById('modalWarning');
  const forecastEl = document.getElementById('modalForecast');
  const findAltBtn = document.getElementById('findAltBtn');

  if (warning) {
    warnEl.classList.remove('hidden');
    document.getElementById('modalWarningText').textContent = warning.note;

    const altsEl = document.getElementById('modalAlternatives');
    altsEl.innerHTML = warning.alternatives.map(alt => `
      <div class="bg-green-900/30 border border-green-700/40 rounded-lg p-2 text-xs">
        <div class="flex justify-between items-center mb-1">
          <span class="text-green-400 font-bold">${alt.name}</span>
          <span class="text-emerald-300">GWP: ${alt.gwp} <span class="text-green-400 font-bold">(↓${alt.saving})</span></span>
        </div>
        <div class="text-amber-300 mb-1">💰 市售參考：${alt.price}</div>
        <div class="text-slate-300">${alt.note}</div>
      </div>
    `).join('');

    // 5-year savings forecast
    forecastEl.classList.remove('hidden');
    const altGWP = warning.alternatives[0]?.gwp || 100;
    const savingRatio = 1 - altGWP / warning.gwp;
    const annualSaving = co2 * savingRatio;
    document.getElementById('modalForecastContent').innerHTML = [1,2,3,5].map(y => `
      <div class="forecast-bar">
        <span class="text-slate-400">替換後 ${y} 年</span>
        <span class="text-green-400 font-bold">省 ${(annualSaving * y).toFixed(2)} tCO₂e</span>
      </div>
    `).join('');

    findAltBtn.classList.remove('hidden');
  } else {
    warnEl.classList.add('hidden');
    forecastEl.classList.add('hidden');
    findAltBtn.classList.add('hidden');
  }

  // Show modal
  const modal = document.getElementById('deviceModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // XP gain
  gameState.totalXP += 10;
  renderEmissionStats();
}

function closeModal() {
  const modal = document.getElementById('deviceModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// =============================================
// 13. 替代方案 Modal
// =============================================
function openAlternativeSearch() {
  const device = gameState.selectedDevice;
  if (!device) return;
  const warning = getGWPWarning(device);
  if (!warning) return;

  closeModal();

  const altModal = document.getElementById('altModal');
  const altContent = document.getElementById('altContent');

  altContent.innerHTML = `
    <div class="text-sm text-slate-400 mb-2">當前設備：<span class="text-white font-bold">${device.name}</span></div>
    <div class="text-sm text-red-400 mb-4">冷媒 ${warning.refrigerant}，GWP = ${warning.gwp.toLocaleString()}</div>
    <div class="space-y-3">
      ${warning.alternatives.map(alt => `
        <div class="alt-card">
          <h4>✅ 建議替換為：${alt.name}</h4>
          <div class="grid grid-cols-3 gap-2 mb-2">
            <div class="text-center">
              <div class="text-slate-400 text-[10px]">GWP</div>
              <div class="text-green-400 font-bold">${alt.gwp}</div>
            </div>
            <div class="text-center">
              <div class="text-slate-400 text-[10px]">減排幅度</div>
              <div class="saving">↓ ${alt.saving}</div>
            </div>
            <div class="text-center">
              <div class="text-slate-400 text-[10px]">參考價格</div>
              <div class="price">${alt.price}</div>
            </div>
          </div>
          <p class="text-slate-300 text-xs leading-relaxed">${alt.note}</p>
        </div>
      `).join('')}
    </div>
    <div class="bg-blue-900/30 border border-blue-700/40 rounded-lg p-3 text-xs text-blue-200 mt-2">
      💡 替換建議：建議聯絡原廠或認證工程師進行評估，勿自行充填冷媒。
    </div>
  `;

  altModal.classList.remove('hidden');
  altModal.classList.add('flex');
}

function closeAltModal() {
  const altModal = document.getElementById('altModal');
  altModal.classList.add('hidden');
  altModal.classList.remove('flex');
}

// =============================================
// 14. 模擬新增排放源
// =============================================
function addSimDevice() {
  const name = document.getElementById('simDeviceName').value.trim();
  const type = document.getElementById('simDeviceType').value;

  if (!name || !type) {
    alert('請填寫設備名稱並選擇類型！');
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
    x: 50 + Math.random() * (spritesLayer.clientWidth - 150),
    y: 50 + Math.random() * (spritesLayer.clientHeight - 150),
    isSim: true
  };

  gameState.devices.push(newDevice);
  document.getElementById('simDeviceName').value = '';
  document.getElementById('simDeviceType').value = '';

  gameState.totalXP += 30;

  renderAll();
  showToast(`✅ 模擬設備「${name}」已加入地圖！`);
}

// =============================================
// 15. 圖片上傳與像素化
// =============================================
function handleFloorPlanUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      gameState.floorPlanImg = img;
      gameState.floorPlanBase64 = e.target.result;
      localStorage.setItem('cfv_floor_plan', e.target.result);
      document.getElementById('defaultMapOverlay').style.display = 'none';
      redrawCanvas();
      showToast('✅ 場地圖已上傳並像素化！');
      gameState.totalXP += 50;
      renderEmissionStats();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function applyPixelEffect() {
  const slider = document.getElementById('pixelSlider');
  gameState.pixelSize = parseInt(slider.value);
  document.getElementById('pixelVal').textContent = gameState.pixelSize + 'px';
  redrawCanvas();
}

// =============================================
// 16. 自動排列設備
// =============================================
function autoArrangeDevices() {
  const cols = Math.ceil(Math.sqrt(gameState.devices.length));
  const colW = (spritesLayer.clientWidth - 100) / cols;
  const rowH = 130;

  gameState.devices.forEach((device, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    device.x = 60 + col * colW;
    device.y = 60 + row * rowH;
  });

  renderSprites();
  showToast('🎯 設備已自動排列！');
}

// =============================================
// 17. 警告開關
// =============================================
function toggleWarnings() {
  gameState.warningsVisible = !gameState.warningsVisible;
  const btn = document.getElementById('warningToggleBtn');
  const warningSprites = spritesLayer.querySelectorAll('.warning-device');
  warningSprites.forEach(el => {
    el.querySelector('.sprite-warning-badge').style.display =
      gameState.warningsVisible ? 'block' : 'none';
  });
  btn.textContent = gameState.warningsVisible ? '⚠️ 隱藏警告' : '⚠️ 顯示警告';
  btn.className = gameState.warningsVisible ? 'pixel-btn-orange text-xs px-3 py-1.5' : 'pixel-btn-back text-xs px-3 py-1.5';
}

// =============================================
// 18. 返回主應用
// =============================================
function goBack() {
  window.location.href = 'index.html';
}

// =============================================
// 19. 綜合渲染
// =============================================
function renderAll() {
  redrawCanvas();
  renderSprites();
  renderDeviceList();
  renderWarnings();
  renderEmissionStats();
}

// =============================================
// 20. Toast 通知
// =============================================
function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: rgba(5, 150, 105, 0.95); color: white;
    padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700;
    border: 2px solid #10b981; z-index: 9999; transition: opacity 0.5s;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 2500);
}

// =============================================
// 21. XP 動畫計數器
// =============================================
function startXPCounter() {
  setInterval(() => {
    // 每30秒獎勵 5 XP（鼓勵持續使用）
  }, 30000);
}

// =============================================
// 22. 隨機減碳小提示
// =============================================
const TIPS = [
  '🌱 將 R-22 冷媒設備更換為 R-32，可減少高達 63% 的冷媒 GWP！',
  '⚡ 改用 LED 照明可比傳統燈具省電 60-70%，減少電力碳排。',
  '🚗 每週減少 1 次貨車運輸，一年可省下約 0.2 tCO₂e。',
  '❄️ 定期保養冷藏設備，可減少冷媒洩漏機率降低逸散排放。',
  '🔋 考慮加裝太陽能板，可抵消部分外購電力碳排（範疇二）。',
  '🏭 ISO 14064-1 碳盤查是企業減碳的第一步，您已踏上正確道路！',
  '📊 R-404A 的 GWP 高達 3922，相當於燃燒 3922 公斤的 CO₂！',
];

let tipIndex = 0;
function showRandomTip() {
  const tipBox = document.getElementById('tipBox');
  if (tipBox) tipBox.textContent = TIPS[tipIndex % TIPS.length];
  tipIndex++;
  setTimeout(showRandomTip, 8000);
}

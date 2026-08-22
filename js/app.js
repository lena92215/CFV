/**
 * 開心農場式：綠色碳管理養成遊戲 - 主控制器與事件處理 (js/app.js)
 * 包含頁面初始化、DOM 事件綁定、分頁切換、彈窗控制與 Excel 匯出
 */

// =========================================================================
// 1. APP MODE & GAME SUB-TAB SWITCHING (模式與子頁籤切換)
// =========================================================================
function switchAppMode(mode) {
  const gameSec = document.getElementById('mode-game-section');
  const formSec = document.getElementById('mode-form-section');
  const btnGame = document.getElementById('btn-mode-game');
  const btnForm = document.getElementById('btn-mode-form');

  if (mode === 'game') {
    if (gameSec) gameSec.classList.remove('hidden');
    if (formSec) formSec.classList.add('hidden');
    if (btnGame) btnGame.className = "px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 bg-emerald-600 text-white shadow-lg transition";
    if (btnForm) btnForm.className = "px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 bg-slate-800 text-slate-300 hover:bg-slate-700 transition";
    updateGameUI();
  } else {
    if (gameSec) gameSec.classList.add('hidden');
    if (formSec) formSec.classList.remove('hidden');
    if (btnGame) btnGame.className = "px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 bg-slate-800 text-slate-300 hover:bg-slate-700 transition";
    if (btnForm) btnForm.className = "px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 bg-emerald-600 text-white shadow-lg transition";
    renderRecordsTable();
  }
}

function switchGameSubTab(tabKey) {
  document.querySelectorAll('.game-sub-view').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.game-sub-tab').forEach(el => {
    el.classList.remove('bg-emerald-600', 'text-white', 'shadow-lg');
    el.classList.add('bg-slate-800', 'text-slate-300');
  });

  const targetSec = document.getElementById(`gsec-${tabKey}`);
  const activeBtn = document.getElementById(`gtab-${tabKey}`);

  if (targetSec) targetSec.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-800', 'text-slate-300');
    activeBtn.classList.add('bg-emerald-600', 'text-white', 'shadow-lg');
  }
}

function switchSheetTab(sheetId) {
  document.querySelectorAll('.sheet-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.sheet-tab').forEach(el => el.classList.remove('active'));

  const sec = document.getElementById(`sec-${sheetId}`);
  const tab = document.getElementById(`stab-${sheetId}`);
  if (sec) sec.classList.remove('hidden');
  if (tab) tab.classList.add('active');
}

// =========================================================================
// 2. FORM INVENTORY LOGIC (功能一二三數據新增與表格處理)
// =========================================================================
function autoFillFactor() {
  const fuel = document.getElementById('inFuelType').value;
  if (FACTOR_MAP[fuel]) {
    document.getElementById('inUnit').value = FACTOR_MAP[fuel].unit;
  }
}

function addSourceRecord() {
  const nameEl = document.getElementById('inEquipName');
  const fuelEl = document.getElementById('inFuelType');
  const activityEl = document.getElementById('inActivityData');
  const unitEl = document.getElementById('inUnit');

  const name = nameEl.value.trim();
  const fuel = fuelEl.value;
  const activity = parseFloat(activityEl.value);
  const unit = unitEl.value;

  if (!name || isNaN(activity) || activity <= 0) {
    alert('請填寫正確的設備名稱與活動數據使用量！');
    return;
  }

  const fInfo = FACTOR_MAP[fuel] || { factor: 1.0, scope: "Scope 1 - 固定燃燒", icon: "⚡", gwp: 1, isHighCarbon: false, plotType: "generator" };
  const carbon = Math.round((activity * fInfo.factor / 1000) * 100) / 100;

  records.push({
    id: Date.now(),
    name,
    fuel,
    scope: fInfo.scope,
    activity,
    unit,
    factor: fInfo.factor,
    carbon,
    icon: fInfo.icon,
    gwp: fInfo.gwp,
    isHighCarbon: fInfo.isHighCarbon,
    plotType: fInfo.plotType
  });

  nameEl.value = '';
  activityEl.value = '';
  renderRecordsTable();
  updateGameUI();

  alert(`🎉 成功新增「${name}」！開心農場已自動生成對應地塊設備！`);
}

function deleteRecord(index) {
  records.splice(index, 1);
  renderRecordsTable();
  updateGameUI();
}

function renderRecordsTable() {
  const tbody = document.getElementById('recordsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  records.forEach((r, idx) => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-900/40";
    tr.innerHTML = `
      <td class="p-3 text-slate-500">${idx + 1}</td>
      <td class="p-3 font-semibold text-slate-200">${r.name}</td>
      <td class="p-3 text-slate-300">${r.fuel}</td>
      <td class="p-3"><span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">${r.scope}</span></td>
      <td class="p-3 text-slate-300">${r.activity} ${r.unit}</td>
      <td class="p-3 font-bold text-emerald-400">${r.carbon} tCO₂e</td>
      <td class="p-3 text-right">
        <button onclick="deleteRecord(${idx})" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash-can"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateFormName() {
  const val = document.getElementById('infoName').value.trim();
  if (val) {
    const nameEl = document.getElementById('gameCompanyName');
    const lbNameEl = document.getElementById('lbYourName');
    if (nameEl) nameEl.innerText = val;
    if (lbNameEl) lbNameEl.innerText = `${val} (您)`;
  }
}

// =========================================================================
// 3. MODALS & EXCEL EXPORT (彈窗控制器與 EXCEL 匯出)
// =========================================================================
function openSimulateModal() {
  const modal = document.getElementById('simModal');
  if (modal) modal.classList.remove('hidden');
}

function closeSimModal() {
  const modal = document.getElementById('simModal');
  if (modal) modal.classList.add('hidden');
}

function saveSimModal() {
  const nameEl = document.getElementById('modalSimName');
  const typeEl = document.getElementById('modalSimType');
  const carbonEl = document.getElementById('modalSimCarbon');

  const name = nameEl.value.trim();
  const type = typeEl.value;
  const carbon = parseFloat(carbonEl.value);

  if (!name || isNaN(carbon) || carbon <= 0) {
    alert('請填寫正確的模擬擴建設備名稱與預估碳排量！');
    return;
  }

  simulatedItems.push({ id: Date.now(), name, type, carbon });
  closeSimModal();
  updateSimulationUI();
}

function openCertificateModal() {
  const compEl = document.getElementById('certCompanyName');
  const baseEl = document.getElementById('certBaseCarbon');
  const currEl = document.getElementById('certCurrentCarbon');
  const savEl = document.getElementById('cert5YearSavings');
  const modal = document.getElementById('certModal');

  if (compEl) compEl.innerText = document.getElementById('infoName').value || "綠洲農場與綠色企業場域";
  if (baseEl) baseEl.innerText = `${getBaseCarbon().toFixed(2)} tCO₂e`;
  if (currEl) currEl.innerText = `${getCurrentCarbon().toFixed(2)} tCO₂e`;
  if (savEl) savEl.innerText = `${get5YearCarbonSavings().toFixed(1)} tCO₂e`;

  if (modal) modal.classList.remove('hidden');
}

function closeCertificateModal() {
  const modal = document.getElementById('certModal');
  if (modal) modal.classList.add('hidden');
}

function sendAiMessage() {
  const input = document.getElementById('aiInput');
  const msg = input.value.trim();
  if (!msg) return;

  const chatBox = document.getElementById('aiChatBox');
  const uDiv = document.createElement('div');
  uDiv.className = "p-2.5 bg-emerald-600/30 rounded-xl border border-emerald-500/30 text-right text-emerald-200 text-xs";
  uDiv.innerText = msg;
  chatBox.appendChild(uDiv);

  input.value = '';

  setTimeout(() => {
    const aiDiv = document.createElement('div');
    aiDiv.className = "p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 text-xs leading-relaxed";
    
    if (msg.includes('GWP') || msg.includes('冷媒')) {
      aiDiv.innerText = "🤖 GWP (全球暖化潛勢) 代表氣體的溫室效應強度！例如 R-22 的 GWP 為 1810，代表 1 公斤 R-22 散逸相當於 1,810 公斤 CO₂！替換為 R-32 可以大幅降低 5 年累計碳排！";
    } else {
      aiDiv.innerText = `🤖 收到您的詢問！建議您在【高碳排警告】頁面查看 5 年預估減碳當量，並優先替換耗能或冷媒設備！`;
    }
    chatBox.appendChild(aiDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 600);
}

function exportToExcel() {
  const wb = XLSX.utils.book_new();
  const s1Data = [["事業名稱", document.getElementById('infoName').value]];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1Data), "一、事業基本資料");

  const s5Header = [["項次", "設備名稱", "燃料種類", "排放範疇", "活動數據", "單位", "排放當量(tCO2e)"]];
  const s5Rows = records.map((r, i) => [i + 1, r.name, r.fuel, r.scope, r.activity, r.unit, r.carbon]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s5Header.concat(s5Rows)), "定量盤查明細");

  XLSX.writeFile(wb, `溫室氣體盤查清冊-${document.getElementById('infoName').value}.xlsx`);
}

// =========================================================================
// 4. INITIALIZATION (DOM 載入完成初始化)
// =========================================================================
window.addEventListener('DOMContentLoaded', () => {
  renderRecordsTable();
  updateGameUI();
  if (records.length > 0 && typeof inspectInitialItem === 'function') {
    inspectInitialItem(records[0]);
  }
});

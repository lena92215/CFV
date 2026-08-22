/**
 * 開心農場式：綠色碳管理養成遊戲 - 遊戲引擎與極致畫面渲染 (js/gameEngine.js)
 * 包含 3D 開心農場地塊渲染、對話氣泡、音效反饋、高碳排警告與 5 年減碳推薦
 */

// =========================================================================
// 1. HAPPY FARM GRID ENGINE (開心農場極致畫面網格渲染)
// =========================================================================
function renderHappyFarmGrid() {
  const gridContainer = document.getElementById('farmGrid');
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  const TOTAL_PLOTS = 12;
  const usedCountEl = document.getElementById('usedPlotsCount');
  if (usedCountEl) usedCountEl.innerText = records.length;

  for (let i = 0; i < TOTAL_PLOTS; i++) {
    const plot = document.createElement('div');
    const item = records[i]; // 對應使用者盤查輸入的資料列

    if (item) {
      // 渲染已解鎖放置實體設備的地塊
      const isReplaced = installedReplacements.has(item.id);
      plot.className = `farm-plot p-3.5 flex flex-col justify-between min-h-[155px] ${item.isHighCarbon && !isReplaced ? 'border-rose-500/60 bg-rose-950/20' : (isReplaced ? 'border-emerald-500/60 bg-emerald-950/30' : '')}`;
      plot.onclick = (e) => onPlotClick(e, item, plot);

      // 動態對話氣泡 (Speech Bubble)
      let bubbleHtml = '';
      if (item.isHighCarbon && !isReplaced) {
        bubbleHtml = `<div class="speech-bubble absolute -top-3 left-2 z-20">💬 高冷媒漏碳中</div>`;
      } else if (isReplaced) {
        bubbleHtml = `<div class="speech-bubble absolute -top-3 left-2 z-20 border-emerald-500 text-emerald-300">🌱 R-32 節能運行中</div>`;
      }

      // 動態圖示與文字 (冷氣轉動風扇、柴油車行駛跳動、發電機閃爍)
      let animatedIcon = item.icon;
      if (item.plotType === 'ac') {
        animatedIcon = `<div class="relative flex items-center justify-center my-1">
          <span class="text-4xl">❄️</span>
          <span class="absolute text-emerald-400 font-bold fan-spin text-sm">🌀</span>
        </div>`;
      } else if (item.plotType === 'truck') {
        animatedIcon = `<div class="car-anim text-4xl my-1">${isReplaced ? '⚡🚚' : '🚚'}</div>`;
      } else if (item.plotType === 'generator') {
        animatedIcon = `<div class="text-4xl animate-bounce my-1">${isReplaced ? '🔋' : '⚡'}</div>`;
      }

      plot.innerHTML = `
        ${bubbleHtml}
        <div class="flex justify-between items-start mt-1">
          <span class="text-[10px] font-black text-emerald-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-emerald-500/30">地號 #${i + 1}</span>
          ${item.isHighCarbon && !isReplaced ? '<span class="bubble-warning px-2 py-0.5 rounded-md bg-gradient-to-r from-rose-600 to-red-500 text-slate-950 text-[9px] font-black shadow">⚠️ 警示</span>' : (isReplaced ? '<span class="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[9px] font-black shadow">🌱 已減碳</span>' : '<span class="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-300 text-[9px] font-bold">常態</span>')}
        </div>

        <div class="my-auto text-center">
          ${animatedIcon}
          <div class="font-black text-slate-100 text-xs mt-1 truncate">${item.name}</div>
        </div>

        <div class="flex justify-between items-center text-[10px] border-t border-slate-700/60 pt-1.5">
          <span class="text-slate-400 font-medium">${item.fuel}</span>
          <span class="font-black text-emerald-400">${item.carbon} tCO₂e</span>
        </div>
      `;
    } else {
      // 未解鎖的空白地塊
      plot.className = `farm-plot p-3.5 flex flex-col items-center justify-center min-h-[155px] opacity-60 border-slate-700 hover:opacity-100`;
      plot.onclick = (e) => {
        playHarvestSound();
        spawnFloatingText(e, "🌱 輸入數據解鎖地塊！", "#10b981");
        if (window.switchAppMode) window.switchAppMode('form');
      };
      plot.innerHTML = `
        <span class="text-3xl text-slate-600">➕</span>
        <span class="text-[11px] text-slate-500 font-bold mt-1">地號 #${i + 1} 空地</span>
        <span class="text-[9px] text-slate-400 mt-0.5">點擊填報解鎖</span>
      `;
    }

    gridContainer.appendChild(plot);
  }
}

// 點擊開心農場土地事件與音效反饋
function onPlotClick(e, item, plotEl) {
  inspectInitialItem(item);
  playHarvestSound();
  spawnFloatingText(e, "+50 XP 🌾", "#f59e0b");
  userXp += 20;
  updateGameUI();
}

// 綠色收穫 Web Audio 音效產生器 (Web Audio API Synthesizer)
function playHarvestSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (err) {
    // Silent fallback if audio context blocked
  }
}

// 動態飄浮文字 (Happy Farm Floating XP & Text)
function spawnFloatingText(e, text, color) {
  const f = document.createElement('div');
  f.className = 'floating-text text-sm';
  f.style.color = color;
  f.innerText = text;
  f.style.left = `${e.pageX - 30}px`;
  f.style.top = `${e.pageY - 25}px`;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1300);
}

// 檢視設備細部數據
function inspectInitialItem(item) {
  const iconEl = document.getElementById('inspectIcon');
  const titleEl = document.getElementById('inspectTitle');
  const subEl = document.getElementById('inspectSubtitle');
  const bodyEl = document.getElementById('inspectBody');

  if (iconEl) iconEl.innerText = item.icon;
  if (titleEl) titleEl.innerText = item.name;
  if (subEl) subEl.innerText = `${item.scope} | GWP: ${item.gwp}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-slate-400">使用燃料/氣體：</span>
          <span class="font-bold text-slate-200">${item.fuel}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">年度活動數據量：</span>
          <span class="font-bold text-slate-200">${item.activity} ${item.unit}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">排放係數：</span>
          <span class="font-bold text-slate-200">${item.factor}</span>
        </div>
        <div class="flex justify-between pt-2 border-t border-slate-700">
          <span class="text-slate-400">年碳排放當量：</span>
          <span class="font-black text-emerald-400 text-sm">${item.carbon} tCO₂e</span>
        </div>
      </div>
    `;
  }
}

// =========================================================================
// 2. HIGH CARBON WARNING & 5-YEAR RECOMMENDATIONS (高碳排警告與5年減碳計算)
// =========================================================================
function renderWarningsAndRecommendations() {
  const container = document.getElementById('warningsGridContainer');
  if (!container) return;
  container.innerHTML = '';

  const highCarbonItems = records.filter(r => r.isHighCarbon || r.gwp > 100);
  const countEl = document.getElementById('warningCountText');
  if (countEl) countEl.innerText = highCarbonItems.length;

  highCarbonItems.forEach(item => {
    const isReplaced = installedReplacements.has(item.id);
    const annualCut = Math.round(item.carbon * 0.75 * 100) / 100;
    const fiveYearCut = Math.round(annualCut * 5 * 10) / 10;
    const refPrice = item.fuel.includes('R-22') ? 12.0 : (item.fuel.includes('R-404A') ? 25.0 : 18.0);

    let recTitle = "🌿 推薦替代：R-32 變頻一級能效冷氣空調";
    let recDesc = "蒙特婁公約管制的 R-22 冷媒 GWP 高達 1810！更換為低 GWP 之 R-32 變頻冷氣，可大幅降低逸散當量與電力消耗！";

    if (item.fuel.includes('柴油')) {
      recTitle = "🌿 推薦替代：鋰電智慧電動機台／發電機備援";
      recDesc = "舊型柴油設備產生高碳排與空氣污染，建議替換為高效率綠電鋰電池備援系統。";
    }

    const card = document.createElement('div');
    card.className = `glass-card warning-card rounded-2xl p-5 flex flex-col justify-between ${isReplaced ? 'border-emerald-500/50 bg-emerald-950/20' : ''}`;

    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-3">
          <div>
            <span class="px-2 py-0.5 bg-rose-500 text-slate-950 text-[10px] font-black rounded-md uppercase">⚠️ 高碳排警示</span>
            <h4 class="font-bold text-slate-100 text-base mt-1">${item.name}</h4>
            <p class="text-xs text-rose-300">使用 ${item.fuel} (GWP: ${item.gwp}) | 年碳排: ${item.carbon} tCO₂e</p>
          </div>
          <span class="text-3xl p-2 rounded-xl bg-slate-900">${item.icon}</span>
        </div>

        <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 mb-4 text-xs">
          <div class="font-bold text-emerald-400 flex items-center gap-1.5">
            <i class="fa-solid fa-seedling"></i> ${recTitle}
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed">${recDesc}</p>
        </div>
      </div>

      <div class="space-y-3 pt-3 border-t border-slate-700/50 text-xs">
        <div class="grid grid-cols-2 gap-2">
          <div class="p-2 bg-slate-900 rounded-lg">
            <div class="text-[10px] text-slate-400">市售參考價格</div>
            <div class="font-bold text-amber-400">$${refPrice} 萬元</div>
          </div>
          <div class="p-2 bg-emerald-950/50 rounded-lg border border-emerald-500/30">
            <div class="text-[10px] text-emerald-300">預估 5 年累計減碳當量</div>
            <div class="font-black text-emerald-400">${fiveYearCut} tCO₂e</div>
          </div>
        </div>

        <button onclick="applyEcoReplacement(${item.id}, ${refPrice})" ${isReplaced || userBudget < refPrice ? 'disabled' : ''} class="w-full py-2.5 rounded-xl font-bold text-xs ${isReplaced ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'} transition">
          ${isReplaced ? '✅ 已執行綠色替代替換' : (userBudget < refPrice ? '預算不足' : '立即執行綠色升級替換')}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function applyEcoReplacement(itemId, price) {
  if (userBudget < price || installedReplacements.has(itemId)) return;

  userBudget -= price;
  installedReplacements.add(itemId);
  userXp += 200;

  playHarvestSound();
  updateGameUI();
  renderWarningsAndRecommendations();

  alert(`🎉 成功執行綠色升級替換！獲得 200 XP！\n開心農場對應設備已動態升級！預估 5 年內為您減少大量碳費成本！`);
}

// =========================================================================
// 3. WHAT-IF SIMULATION ENGINE (情境模擬計算)
// =========================================================================
function updateSimulationUI() {
  const baseCarbon = getCurrentCarbon();
  const addedCarbon = simulatedItems.reduce((sum, item) => sum + item.carbon, 0);
  const totalSimCarbon = Math.round((baseCarbon + addedCarbon) * 100) / 100;

  const baseEl = document.getElementById('simBaseCarbonText');
  const addedEl = document.getElementById('simAddedCarbonText');
  const countEl = document.getElementById('simAddedCountText');
  const totalEl = document.getElementById('simTotalCarbonText');

  if (baseEl) baseEl.innerText = `${baseCarbon.toFixed(2)} tCO₂e`;
  if (addedEl) addedEl.innerText = `+ ${addedCarbon.toFixed(2)} tCO₂e`;
  if (countEl) countEl.innerText = `已加入 ${simulatedItems.length} 項模擬擴建`;
  if (totalEl) totalEl.innerText = `${totalSimCarbon.toFixed(2)} tCO₂e`;

  const tbody = document.getElementById('simTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (simulatedItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">目前尚無模擬擴建項目，點擊右上角「新增模擬擴建設備」試算！</td></tr>`;
    return;
  }

  simulatedItems.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-900/40";
    tr.innerHTML = `
      <td class="p-2.5 font-semibold text-slate-200">${item.name}</td>
      <td class="p-2.5 text-slate-400">${item.type}</td>
      <td class="p-2.5 text-slate-400">1 式</td>
      <td class="p-2.5 font-bold text-rose-400">+ ${item.carbon} tCO₂e</td>
      <td class="p-2.5 text-right">
        <button onclick="deleteSimItem(${idx})" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash-can"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteSimItem(index) {
  simulatedItems.splice(index, 1);
  updateSimulationUI();
}

// 刷新全遊戲介面 UI
function updateGameUI() {
  const baseCarbon = getBaseCarbon();
  const currCarbon = getCurrentCarbon();
  const savings5Years = get5YearCarbonSavings();

  const baseCarbEl = document.getElementById('gameBaseCarbon');
  const currCarbEl = document.getElementById('gameCurrentCarbon');
  const budgetEl = document.getElementById('gameBudget');
  const savingsEl = document.getElementById('game5YearSavings');

  if (baseCarbEl) baseCarbEl.innerText = baseCarbon.toFixed(2);
  if (currCarbEl) currCarbEl.innerText = currCarbon.toFixed(2);
  if (budgetEl) budgetEl.innerText = `$${userBudget} 萬`;
  if (savingsEl) savingsEl.innerText = `${savings5Years.toFixed(1)} tCO₂e`;

  const xpBarEl = document.getElementById('xpBar');
  const xpTextEl = document.getElementById('xpText');
  const xpNeededEl = document.getElementById('xpNeeded');

  if (xpBarEl) xpBarEl.style.width = `${(userXp / 1000) * 100}%`;
  if (xpTextEl) xpTextEl.innerText = `${userXp} / 1000`;
  if (xpNeededEl) xpNeededEl.innerText = `${Math.max(0, 1000 - userXp)} XP`;

  renderHappyFarmGrid();
  renderWarningsAndRecommendations();
  updateSimulationUI();
}

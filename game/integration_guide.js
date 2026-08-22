// =============================================
// 整合代碼：加入現有 index.html 的 <script> 區塊
// 此檔案說明需要在 index.html 中新增的三個部分
// =============================================

// ===== 第一部分：修改「轉化為減碳遊戲」按鈕 =====
// 找到 index.html 中這一行：
//   <button onclick="switchAppMode('game')" ...>
// 改為：
//   <button onclick="launchGame()" ...>
// 或在 script 區塊中加入以下函式：

function launchGame() {
  // 1. 儲存公司基本資訊到 localStorage
  const companyInfo = {
    name: document.getElementById('infoName')?.value || '我的工廠',
    taxId: document.getElementById('infoTaxId')?.value || '',
    owner: document.getElementById('infoOwner')?.value || '',
    industry: document.getElementById('infoIndustry')?.value || '',
    year: document.getElementById('infoYear')?.value || '',
  };
  localStorage.setItem('cfv_company_info', JSON.stringify(companyInfo));

  // 2. 儲存排放源設備清單到 localStorage
  // 注意：此處 emissionSources 為 index.html 中的全域陣列
  if (typeof emissionSources !== 'undefined') {
    const sourcesForGame = emissionSources.map(s => ({
      id: s.id,
      name: s.name,
      energy: s.energy,
      quantity: s.quantity || 1,
      location: s.location || '',
      scope: s.scope || '',
      ghg: s.ghg || []
    }));
    localStorage.setItem('cfv_emission_sources', JSON.stringify(sourcesForGame));
  }

  // 3. 若有上傳場地圖，從 localStorage 讀取後帶入（已由 handleFloorPlanUpload 儲存）

  // 4. 跳轉至遊戲頁面
  window.location.href = 'game.html';
}

// ===== 第二部分：邊界設定 Sheet2 新增圖片上傳欄位 =====
// 在 index.html 的 sheet2 (二、邊界設定) div 內，
// 在現有欄位 grid 的最後加入以下 HTML：

const FLOOR_PLAN_UPLOAD_HTML = `
<div class="md:col-span-2 lg:col-span-3">
  <label class="block text-slate-400 mb-1">🗺️ 場地平面圖上傳（選填，用於碳排遊戲地圖）</label>
  <div class="flex items-center gap-3">
    <input type="file" id="boundFloorPlan" accept="image/*"
      onchange="saveFloorPlanForGame(event)"
      class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 
             focus:border-emerald-500 focus:outline-none text-xs file:mr-3 
             file:py-1 file:px-3 file:rounded-lg file:border-0 
             file:bg-emerald-700 file:text-white file:text-xs file:cursor-pointer"
    />
    <img id="floorPlanPreview" src="" alt=""
      class="hidden w-24 h-16 object-cover rounded border border-emerald-700"
    />
  </div>
  <p class="text-slate-500 text-[10px] mt-1">
    支援 JPG / PNG，上傳後點選「轉化為減碳遊戲」即可看到您的場地地圖
  </p>
</div>
`;

// 處理場地圖上傳並存入 localStorage
function saveFloorPlanForGame(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    localStorage.setItem('cfv_floor_plan', e.target.result);
    const preview = document.getElementById('floorPlanPreview');
    if (preview) {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    }
  };
  reader.readAsDataURL(file);
}

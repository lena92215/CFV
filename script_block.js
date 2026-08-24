
    // =============================================
    // 原(燃)物料下拉選單載入函式
    // 資料來源：Emission-source/materials_data.js（即 window.MATERIAL_LIST）
    // =============================================

    /**
     * loadMaterialsFromCSV()
     * ----------------------
     * 從 window.MATERIAL_LIST（由 materials_data.js 預先載入）
     * 填充 #esEnergy 與 #editESEnergy 兩個下拉選單。
     *
     * 資料欄位：{ seq, code, name, label }
     * 共 6,255 筆原(燃)物料種類
     */
    function loadMaterialsFromCSV() {
      const SELECT_IDS = ['esEnergy', 'editESEnergy'];

      if (!window.MATERIAL_LIST || window.MATERIAL_LIST.length === 0) {
        console.warn('[loadMaterials] window.MATERIAL_LIST 未定義，請確認 materials_data.js 已正確載入。');
        _fillFallbackOptions(SELECT_IDS);
        return;
      }

      const rows = window.MATERIAL_LIST;

      SELECT_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        // 儲存目前選定值（編輯 Modal 可能已填入）
        const prevValue = el.value;
        el.innerHTML = '';

        // 加一個空白提示選項
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '— 請選擇原(燃)物料 —';
        placeholder.disabled = true;
        el.appendChild(placeholder);

        // 填入全部 6255 筆物料
        rows.forEach(r => {
          const opt = document.createElement('option');
          opt.value        = r.name;   // value 使用名稱，與 GHG 自動對照相容
          opt.dataset.code = r.code;  // 儲存代碼
          opt.textContent  = `${r.code}　${r.name}`;
          el.appendChild(opt);
        });

        // 恢復原選定值
        if (prevValue) el.value = prevValue;
      });

      updateESPreview();
      console.log(`[loadMaterials] 完成：${rows.length} 筆原(燃)物料種類已載入選單。`);
    }

    /**
     * 解析 CSV 文字內容，回傳 {seq, code, name, label}[]。
     * （保留供外部呼叫，實際用途已由 materials_data.js 取代）
     */
    function _parseCSVText(text) {
      const lines = text.split(/\r?\n/);
      const result = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length < 3) continue;
        const seq  = cols[0].trim();
        const code = cols[1].trim();
        const name = cols[2].trim();
        if (!code || !name) continue;
        let label = cols.length > 3 ? cols[3].trim() : `${code} ${name}`;
        const prefix = `${seq}. `;
        if (label.startsWith(prefix)) label = label.slice(prefix.length);
        result.push({ seq: parseInt(seq) || 0, code, name, label });
      }
      return result;
    }

    /** 資料載入失敗時的回退預設選項 */
    function _fillFallbackOptions(selectIds) {
      const fallback = [
        { code: '170001', name: '車用汽油' },
        { code: '170006', name: '車用柴油' },
        { code: '050004', name: '液化天然氣(LNG)' },
        { code: '170050', name: '桶裝瓦斯(LPG)' },
        { code: '190239', name: '冷媒(R-410A)' },
        { code: '190240', name: '冷媒(R-404A)' },
        { code: '190278', name: '乾粉滅火藥劑' },
        { code: 'EL0001', name: '外購電力' },
      ];
      selectIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '';
        fallback.forEach(f => {
          const opt = document.createElement('option');
          opt.value = f.name;
          opt.textContent = `${f.code}　${f.name}`;
          el.appendChild(opt);
        });
      });
      window.MATERIAL_LIST = fallback.map(f => ({ code: f.code, name: f.name, label: `${f.code} ${f.name}`, seq: 0 }));
    }


    // =============================================
    // AC-02: 七大 GHG 自動對照表
    const ES_MATERIAL_MAP = {
      '外購電力':           { sourceType: '外購能源',  scope: '範疇二 (能源間接)', ghg: ['CO₂', 'CH₄', 'N₂O'] },
      '車用柴油':           { sourceType: '移動燃燒',  scope: '範疇一 (直接排放)', ghg: ['CO₂', 'CH₄', 'N₂O'] },
      '車用汽油':           { sourceType: '移動燃燒',  scope: '範疇一 (直接排放)', ghg: ['CO₂', 'CH₄', 'N₂O'] },
      '桶裝瓦斯(LPG)':     { sourceType: '固定燃燒',  scope: '範疇一 (直接排放)', ghg: ['CO₂', 'CH₄', 'N₂O'] },
      '冷氣冷媒(R-410A)':  { sourceType: '逸散排放',  scope: '範疇一 (直接排放)', ghg: ['HFCs'] },
      '冷藏冷媒(R-404A)':  { sourceType: '逸散排放',  scope: '範疇一 (直接排放)', ghg: ['HFCs'] },
      '乾粉滅火藥劑':       { sourceType: '逸散排放',  scope: '範疇一 (直接排放)', ghg: ['CO₂'] }
    };

    // AC-01: 預填示範設備（對應既有 4 筆 records）
    let emissionSources = [];

    // 取得某設備的自動判斷結果
    function getESAuto(energy) {
      return ES_MATERIAL_MAP[energy] || { sourceType: '其他', scope: '範疇一 (直接排放)', ghg: ['CO₂'] };
    }

    // AC-02: 更新新增表單的 GHG 預覽區
    function updateESPreview() {
      const energy = document.getElementById('esEnergy').value;
      const auto   = getESAuto(energy);
      const isScope2 = auto.scope.includes('二');
      const scopeColor = isScope2
        ? 'text-cyan-300 bg-cyan-900/40 border-cyan-500/30'
        : 'text-amber-300 bg-amber-900/40 border-amber-500/30';
      document.getElementById('esPreviewScope').className =
        `px-2 py-0.5 rounded border text-[11px] font-semibold ${scopeColor}`;
      document.getElementById('esPreviewScope').textContent = auto.scope;
      document.getElementById('esPreviewGHG').innerHTML = auto.ghg.map(g =>
        `<span class="px-1.5 py-0.5 rounded bg-slate-700 border border-slate-600 text-slate-200 text-[10px] font-mono">${g}</span>`
      ).join('');
    }

    // AC-01: 新增設備
    function addEmissionSource() {
      const equipId  = document.getElementById('esEquipId').value.trim();
      const name     = document.getElementById('esEquipName').value.trim();
      const location = document.getElementById('esLocation').value.trim();
      const quantity = parseInt(document.getElementById('esQuantity').value) || 1;
      const energy   = document.getElementById('esEnergy').value;

      if (!equipId || !name || !location) {
        alert('請填寫設備編號、設備名稱及所屬部門/位置！');
        return;
      }
      if (emissionSources.some(e => e.equipId === equipId)) {
        alert(`設備編號「${equipId}」已存在，請使用不同編號。`);
        return;
      }

      emissionSources.push({ id: Date.now(), equipId, name, location, energy, quantity });

      document.getElementById('esEquipId').value  = '';
      document.getElementById('esEquipName').value = '';
      document.getElementById('esLocation').value  = '';
      document.getElementById('esQuantity').value  = '1';

      renderEmissionSourceTable();
    }

    // AC-03: 刪除（含二次確認與連動警告）
    function deleteEmissionSource(index) {
      const es = emissionSources[index];
      const confirmed = confirm(
        `確定要刪除排放源設備「${es.name}」(${es.equipId})？\n\n` +
        `⚠️ 注意：刪除此設備後，相關聯的\n` +
        `「四、活動數據」與「五、定量盤查明細」資料\n` +
        `將一併異動，請確認後再繼續。`
      );
      if (!confirmed) return;
      emissionSources.splice(index, 1);
      renderEmissionSourceTable();
    }

    // AC-03: 開啟編輯 Modal
    function openEditModal(index) {
      const es = emissionSources[index];
      document.getElementById('editESIndex').value    = index;
      document.getElementById('editESId').value       = es.equipId;
      document.getElementById('editESName').value     = es.name;
      document.getElementById('editESLocation').value = es.location;
      document.getElementById('editESQuantity').value = es.quantity;
      document.getElementById('editESEnergy').value   = es.energy;
      document.getElementById('esEditModal').classList.remove('hidden');
    }

    function closeEditModal() {
      document.getElementById('esEditModal').classList.add('hidden');
    }

    // AC-03: 儲存編輯
    function saveEditModal() {
      const index    = parseInt(document.getElementById('editESIndex').value);
      const equipId  = document.getElementById('editESId').value.trim();
      const name     = document.getElementById('editESName').value.trim();
      const location = document.getElementById('editESLocation').value.trim();
      const quantity = parseInt(document.getElementById('editESQuantity').value) || 1;
      const energy   = document.getElementById('editESEnergy').value;

      if (!equipId || !name || !location) {
        alert('請填寫設備編號、設備名稱及所屬部門/位置！');
        return;
      }
      // 編號唯一性檢查（排除自身）
      const duplicate = emissionSources.some((e, i) => i !== index && e.equipId === equipId);
      if (duplicate) {
        alert(`設備編號「${equipId}」已被其他設備使用。`);
        return;
      }

      emissionSources[index] = { ...emissionSources[index], equipId, name, location, energy, quantity };
      closeEditModal();
      renderEmissionSourceTable();
    }

    // AC-03: 渲染清單（支援關鍵字搜尋）
    function renderEmissionSourceTable() {
      const tbody  = document.getElementById('esTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      const keyword = (document.getElementById('esSearchInput')?.value || '').trim().toLowerCase();
      const filtered = keyword
        ? emissionSources.filter(e =>
            e.name.toLowerCase().includes(keyword) ||
            e.location.toLowerCase().includes(keyword) ||
            e.energy.toLowerCase().includes(keyword) ||
            e.equipId.toLowerCase().includes(keyword)
          )
        : emissionSources;

      filtered.forEach((es, filteredIdx) => {
        const realIdx = emissionSources.indexOf(es);
        const auto = getESAuto(es.energy);
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-900/40 transition-colors';

        // GHG tags
        const ghgTags = auto.ghg.map(g =>
          `<span class="px-1.5 py-0.5 rounded bg-slate-700 border border-slate-600 text-slate-200 text-[10px] font-mono">${g}</span>`
        ).join(' ');

        // Scope badge
        const isScope2   = auto.scope.includes('二');
        const scopeColor = isScope2
          ? 'text-cyan-300 bg-cyan-900/40 border-cyan-500/30'
          : 'text-amber-300 bg-amber-900/40 border-amber-500/30';
        const scopeBadge = `<span class="px-2 py-0.5 rounded border text-[10px] font-semibold whitespace-nowrap ${scopeColor}">${auto.scope}</span>`;

        tr.innerHTML = `
          <td class="p-3 font-mono text-slate-400 whitespace-nowrap">${es.equipId}</td>
          <td class="p-3 font-semibold text-slate-200 whitespace-nowrap">${es.name}</td>
          <td class="p-3 text-slate-400 whitespace-nowrap">${es.location}</td>
          <td class="p-3 text-slate-300 whitespace-nowrap">${es.energy}</td>
          <td class="p-3">${scopeBadge}</td>
          <td class="p-3"><div class="flex flex-wrap gap-1">${ghgTags}</div></td>
          <td class="p-3 text-slate-300 text-center">${es.quantity}</td>
          <td class="p-3 text-center">
            <div class="flex justify-center gap-2">
              <button onclick="openEditModal(${realIdx})" title="編輯" class="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition text-[11px] flex items-center gap-1"><i class="fa-solid fa-pen text-[9px]"></i> 編輯</button>
              <button onclick="deleteEmissionSource(${realIdx})" title="刪除" class="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-400 hover:text-rose-200 border border-rose-500/30 transition text-[11px] flex items-center gap-1"><i class="fa-solid fa-trash-can text-[9px]"></i> 刪除</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      document.getElementById('esCount').innerText = emissionSources.length;
    }

    // =============================================
    // State Store for Form Records
    let records = [];

    // Factors lookup
    const FACTOR_MAP = {
      "外購電力": { factor: 0.495, unit: "度 (kWh)", scope: "Scope 2 - 外購電力" },
      "車用柴油": { factor: 2.66, unit: "公升", scope: "Scope 1 - 移動燃燒" },
      "車用汽油": { factor: 2.36, unit: "公升", scope: "Scope 1 - 移動燃燒" },
      "桶裝瓦斯(LPG)": { factor: 3.11, unit: "公斤", scope: "Scope 1 - 固定燃燒" },
      "冷氣冷媒(R-410A)": { factor: 2088, unit: "kg", scope: "Scope 1 - 逸散排放" },
      "冷藏冷媒(R-404A)": { factor: 3922, unit: "kg", scope: "Scope 1 - 逸散排放" },
      "乾粉滅火藥劑": { factor: 28, unit: "kg", scope: "Scope 1 - 逸散排放" }
    };

    function autoFillFactor() {
      const fuel = document.getElementById('inFuelType').value;
      if (FACTOR_MAP[fuel]) {
        document.getElementById('inUnit').value = FACTOR_MAP[fuel].unit;
      }
    }

    function addSourceRecord() {
      const name = document.getElementById('inEquipName').value.trim();
      const fuel = document.getElementById('inFuelType').value;
      const activity = parseFloat(document.getElementById('inActivityData').value);
      const unit = document.getElementById('inUnit').value;

      if (!name || isNaN(activity) || activity <= 0) {
        alert('請填寫正確的設備名稱與活動數據使用量！');
        return;
      }

      const fInfo = FACTOR_MAP[fuel] || { factor: 1.0, scope: "Scope 1 - 固定燃燒" };
      const carbon = Math.round((activity * fInfo.factor / 1000) * 100) / 100;

      records.push({
        id: Date.now(),
        name,
        fuel,
        scope: fInfo.scope,
        activity,
        unit,
        factor: fInfo.factor,
        carbon
      });

      document.getElementById('inEquipName').value = '';
      document.getElementById('inActivityData').value = '';
      renderRecordsTable();
    }

    function deleteRecord(index) {
      records.splice(index, 1);
      renderRecordsTable();
    }

    function getTotalCarbon() {
      return records.reduce((s, i) => s + i.carbon, 0);
    }

    function renderRecordsTable() {
      const tbody = document.getElementById('recordsTableBody');
      tbody.innerHTML = '';

      let s1 = 0, s2 = 0;

      records.forEach((r, idx) => {
        if (r.scope.includes('Scope 1')) s1 += r.carbon;
        if (r.scope.includes('Scope 2')) s2 += r.carbon;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-900/40";
        tr.innerHTML = `
          <td class="p-3 text-slate-500">${idx + 1}</td>
          <td class="p-3 font-semibold text-slate-200">${r.name}</td>
          <td class="p-3 text-slate-300">${r.fuel}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">${r.scope}</span></td>
          <td class="p-3 text-slate-300">${r.activity} ${r.unit}</td>
          <td class="p-3 text-slate-400">${r.factor}</td>
          <td class="p-3 font-bold text-emerald-400">${r.carbon} tCO₂e</td>
          <td class="p-3 text-right">
            <button onclick="deleteRecord(${idx})" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      const total = getTotalCarbon();
      document.getElementById('recordCount').innerText = records.length;
      document.getElementById('recordTotalCarbon').innerText = total.toFixed(2);

      document.getElementById('sumScope1').innerText = `${s1.toFixed(2)} tCO₂e`;
      document.getElementById('sumScope2').innerText = `${s2.toFixed(2)} tCO₂e`;
      document.getElementById('sumTotal').innerText = `${total.toFixed(2)} tCO₂e`;

      renderSummaryChart(s1, s2);
    }

    // Chart
    let chartObj = null;
    function renderSummaryChart(s1, s2) {
      const ctx = document.getElementById('summaryChart');
      if (!ctx) return;
      if (chartObj) chartObj.destroy();

      chartObj = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['範疇一 (直接排放)', '範疇二 (外購電力)'],
          datasets: [{
            data: [s1, s2],
            backgroundColor: ['#f59e0b', '#06b6d4'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#cbd5e1' } }
          }
        }
      });
    }

    // Export Real Excel (.xlsx) using SheetJS
    function exportToExcel() {
      const wb = XLSX.utils.book_new();

      // Sheet 1: 基本資料
      const s1Data = [
        ["事業名稱", document.getElementById('infoName').value],
        ["統一編號", document.getElementById('infoTaxId').value],
        ["盤查年度", document.getElementById('infoYear').value],
        ["負責人", document.getElementById('infoOwner').value],
        ["聯絡人", document.getElementById('infoContact').value],
        ["行業別", document.getElementById('infoIndustry').value]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1Data), "一、事業基本資料");

      // Sheet 2: 邊界設定
      const s2Data = [
        ["機構名稱", document.getElementById('boundOrgName').value],
        ["縣市/鄉鎮", document.getElementById('boundCity').value],
        ["地址", document.getElementById('boundAddress').value],
        ["電號", document.getElementById('boundPowerNo').value],
        ["共用電表", document.getElementById('boundSharedPower').value]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2Data), "二、邊界設定");

      // Sheet 3: 排放源鑑別
      const s3Header = [["編號", "設備/設施名稱", "所在位置", "排放源活動類型", "使用能源/物料", "溫室氣體種類", "排放範疇", "是否納入盤查", "排除/不重大原因"]];
      const s3Rows   = emissionSources.map((es, i) => [i + 1, es.name, es.location, es.sourceType, es.energy, es.ghg, es.scope, es.included, es.reason || ""]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s3Header.concat(s3Rows)), "三、排放源鑑別");

      // Sheet 5: 定量盤查紀錄
      const s5Header = [["編號", "設備名稱", "原/燃物料", "排放範疇", "活動數據", "單位", "排放係數", "排放當量(tCO2e)"]];
      const s5Rows = records.map((r, i) => [i + 1, r.name, r.fuel, r.scope, r.activity, r.unit, r.factor, r.carbon]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s5Header.concat(s5Rows)), "五、定量盤查表");

      const vendorNameStr = document.getElementById('infoName').value || "溫室氣體清冊";
      XLSX.writeFile(wb, `溫室氣體排放量清冊表單-${vendorNameStr}.xlsx`);
    }

    // Switch Sheet Tabs
    function switchSheetTab(sheetId) {
      document.querySelectorAll('.sheet-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.sheet-tab').forEach(el => el.classList.remove('active'));

      document.getElementById(`sec-${sheetId}`).classList.remove('hidden');
      document.getElementById(`stab-${sheetId}`).classList.add('active');

      if (sheetId === 'sheet6') {
        renderRecordsTable();
      }
    }

    // App Mode Switcher
    function switchAppMode(mode) {
      if (mode === 'form') {
        document.getElementById('mode-form-section').classList.remove('hidden');
        document.getElementById('mode-game-section').classList.add('hidden');
        document.getElementById('btn-mode-form').className = "px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-emerald-600 text-white shadow-lg transition";
        document.getElementById('btn-mode-game').className = "px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-slate-800 text-slate-300 hover:bg-slate-700 transition";
      } else {
        document.getElementById('mode-form-section').classList.add('hidden');
        document.getElementById('mode-game-section').classList.remove('hidden');
        document.getElementById('btn-mode-form').className = "px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-slate-800 text-slate-300 hover:bg-slate-700 transition";
        document.getElementById('btn-mode-game').className = "px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-emerald-600 text-white shadow-lg transition";

        // Load game with recorded items
        document.getElementById('gameVendorTitle').innerText = document.getElementById('infoName').value || "自訂攤販";
        document.getElementById('gameBaseCarbon').innerText = getTotalCarbon().toFixed(2);
      }
    }

    // Init
    window.addEventListener('DOMContentLoaded', () => {
      renderRecordsTable();
      loadMaterialsFromCSV();      // 載入 CSV 並填充原(燃)物料下拉選單
      renderEmissionSourceTable();
      updateESPreview();
    });
  
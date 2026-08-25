/* =============================================
   CFV 碳管理平台 - 使用者註冊、登入與身份驗證系統
   project/auth_system.js
   ============================================= */

'use strict';

// 初始化帳號資料庫
function getStoredAccounts() {
  try {
    const raw = localStorage.getItem('cfv_accounts');
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// 取得目前登入使用者
function getCurrentUser() {
  try {
    const raw = localStorage.getItem('cfv_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// 設定目前登入使用者
function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('cfv_current_user', JSON.stringify(user));
    // 同步更新公司資訊至 cfv_company_info
    localStorage.setItem('cfv_company_info', JSON.stringify({ name: user.companyName }));
  } else {
    localStorage.removeItem('cfv_current_user');
  }
}

// 切換登入與註冊頁籤
function switchAuthTab(tab) {
  const loginForm = document.getElementById('authLoginForm');
  const regForm = document.getElementById('authRegisterForm');
  const tabLoginBtn = document.getElementById('tabAuthLoginBtn');
  const tabRegBtn = document.getElementById('tabAuthRegBtn');

  if (!loginForm || !regForm) return;

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    tabLoginBtn.className = "flex-1 py-2.5 rounded-xl font-black text-xs bg-emerald-500 text-slate-950 shadow-md transition-all";
    tabRegBtn.className = "flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-slate-400 hover:text-white transition-all";
  } else {
    loginForm.classList.add('hidden');
    regForm.classList.remove('hidden');
    tabLoginBtn.className = "flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-slate-400 hover:text-white transition-all";
    tabRegBtn.className = "flex-1 py-2.5 rounded-xl font-black text-xs bg-emerald-500 text-slate-950 shadow-md transition-all";
  }
}

// 處理登入提交
function handleLoginSubmit(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('authLogEmail');
  const passInput = document.getElementById('authLogPassword');
  const errEl = document.getElementById('authLogErr');

  const email = emailInput?.value.trim();
  const password = passInput?.value.trim();

  if (!email || !password) {
    if (errEl) { errEl.textContent = '⚠️ 請輸入帳號/電子信箱與密碼！'; errEl.classList.remove('hidden'); }
    return;
  }

  const accounts = getStoredAccounts();
  const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);

  if (!found) {
    if (errEl) { errEl.textContent = '❌ 帳號或密碼不正確！請重新檢查或註冊新帳號。'; errEl.classList.remove('hidden'); }
    return;
  }

  if (errEl) errEl.classList.add('hidden');
  setCurrentUser(found);
  applyUserSession(found);
  closeAuthModal();
  showAuthToast(`🎉 歡迎回來，${found.companyName}！`);
}

// 處理註冊提交
function handleRegisterSubmit(event) {
  if (event) event.preventDefault();
  const companyInput = document.getElementById('authRegCompanyName');
  const emailInput = document.getElementById('authRegEmail');
  const passInput = document.getElementById('authRegPassword');
  const passConfirmInput = document.getElementById('authRegPasswordConfirm');
  const industryInput = document.getElementById('authRegIndustry');
  const errEl = document.getElementById('authRegErr');

  const companyName = companyInput?.value.trim();
  const email = emailInput?.value.trim();
  const password = passInput?.value.trim();
  const confirmPass = passConfirmInput?.value.trim();
  const industry = industryInput?.value || '其他';

  if (!companyName || !email || !password) {
    if (errEl) { errEl.textContent = '⚠️ 請完整填寫所有必填欄位！'; errEl.classList.remove('hidden'); }
    return;
  }

  if (password !== confirmPass) {
    if (errEl) { errEl.textContent = '⚠️ 兩次輸入的密碼不一致！'; errEl.classList.remove('hidden'); }
    return;
  }

  const accounts = getStoredAccounts();
  if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    if (errEl) { errEl.textContent = '⚠️ 此電子信箱已註冊過！請直接登入。'; errEl.classList.remove('hidden'); }
    return;
  }

  const newAccount = { companyName, email, password, industry };
  accounts.push(newAccount);
  localStorage.setItem('cfv_accounts', JSON.stringify(accounts));

  if (errEl) errEl.classList.add('hidden');
  setCurrentUser(newAccount);
  applyUserSession(newAccount);
  closeAuthModal();
  showAuthToast(`✨ 註冊成功！歡迎使用 CFV 碳管理平台，${companyName}。`);
}

// 套用登入 session 至頁面
function applyUserSession(user) {
  if (!user) return;

  // 1. 更新 index.html 表單欄位
  const infoName = document.getElementById('infoName');
  const boundOrgName = document.getElementById('boundOrgName');
  const infoIndustry = document.getElementById('infoIndustry');

  if (infoName && !infoName.value) infoName.value = user.companyName;
  if (boundOrgName && !boundOrgName.value) boundOrgName.value = `${user.companyName} - 本場域`;
  if (infoIndustry && user.industry && !infoIndustry.value) infoIndustry.value = user.industry;

  // 2. 更新 game.html 公司名稱
  const gameCompany = document.getElementById('gameCompanyName');
  if (gameCompany) gameCompany.textContent = user.companyName;

  // 3. 更新 Header 帳號區塊
  renderUserHeaderUI(user);
}

// 渲染 Header 帳號 UI
function renderUserHeaderUI(user) {
  const container = document.getElementById('userAccountNav');
  if (!container) return;

  if (user) {
    container.innerHTML = `
      <div class="flex items-center gap-2 bg-slate-900 border border-emerald-500/50 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 shadow-md">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-emerald-400 font-black">👤 ${user.companyName}</span>
        <button onclick="handleLogout()" class="text-rose-400 hover:text-rose-300 font-bold ml-2 transition flex items-center gap-1">
          <i class="fa-solid fa-right-from-bracket"></i> 登出
        </button>
      </div>
    `;
    container.classList.remove('hidden');
  } else {
    container.innerHTML = `
      <button onclick="openAuthModal()" class="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition flex items-center gap-1.5">
        <i class="fa-solid fa-user"></i> 登入 / 註冊
      </button>
    `;
    container.classList.remove('hidden');
  }
}

// 登出
function handleLogout() {
  if (confirm('確定要登出現有帳號嗎？')) {
    setCurrentUser(null);
    showAuthToast('👋 已成功登出。');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  }
}

function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function showAuthToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
    background: #10b981; color: #022c22; padding: 12px 28px; border-radius: 16px;
    font-size: 13px; font-weight: 900; border: 2px solid #34d399; z-index: 99999;
    box-shadow: 0 12px 30px rgba(16, 185, 129, 0.5); transition: opacity 0.4s;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 2500);
}

// 訪客一鍵體驗登入
function handleGuestLogin() {
  const guestUser = {
    companyName: '訪客示範場域',
    email: 'guest@cfv.com',
    industry: '市場與批發零售業'
  };
  setCurrentUser(guestUser);
  applyUserSession(guestUser);
  closeAuthModal();
  showAuthToast('🚀 已以訪客身份進入平台體驗！');
}

// 頁面初始化驗證
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  renderUserHeaderUI(user);

  if (user) {
    applyUserSession(user);
    closeAuthModal();
  } else {
    // 預設關閉強迫彈窗，讓使用者可隨意免費體驗；亦可隨時點擊 Header「登入/註冊」
    closeAuthModal();
  }
});

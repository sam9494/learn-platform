/**
 * 學習進度前端腳本
 * - 在課程頁底部加上「標記為完成」按鈕
 * - 在目錄頁顯示進度條與已完成標記
 */
(function () {
  const API = '/api/progress';
  const fileName = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const lessonId = fileName.replace('.html', '');

  // 課程清單（與目錄頁同步）
  const LESSONS = [
    'a1', 'lesson01', 'lesson02', 'l3', 'l4',
    'g1', 't1', 't2', 'c1', 'c2',
    'v1', 'v2', 's1', 's2'
  ];
  // 目錄頁序號 → 檔名
  const NUM_TO_ID = {
    'A1': 'a1', 'L1': 'lesson01', 'L2': 'lesson02', 'L3': 'l3', 'L4': 'l4',
    'G1': 'g1', 'T1': 't1', 'T2': 't2', 'C1': 'c1', 'C2': 'c2',
    'V1': 'v1', 'V2': 'v2', 'S1': 's1', 'S2': 's2'
  };

  async function getProgress() {
    try {
      const r = await fetch(API);
      if (!r.ok) throw new Error();
      return await r.json();
    } catch {
      console.warn('[progress] 無法連線伺服器（請確認用 npm start 啟動，並從 http://localhost:3000 開啟）');
      return null;
    }
  }
  const markComplete = id =>
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lessonId: id }) });
  const unmark = id =>
    fetch(`${API}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  const clearAll = () =>
    fetch(API, { method: 'DELETE' });

  document.addEventListener('DOMContentLoaded', async () => {
    if (lessonId === 'index' || lessonId === '') {
      await initIndex();
    } else if (LESSONS.includes(lessonId)) {
      await initLesson();
    }
  });

  // --------- 目錄頁 ---------
  async function initIndex() {
    const data = await getProgress();
    const completed = new Set((data || []).map(p => p.lesson_id));

    document.querySelectorAll('.lesson').forEach(el => {
      const numEl = el.querySelector('.lesson-num');
      if (!numEl) return;
      const id = NUM_TO_ID[numEl.textContent.trim()];
      if (id && completed.has(id)) {
        const status = el.querySelector('.status');
        if (status) {
          status.textContent = '✓ DONE';
          status.style.background = 'rgba(74,222,128,0.25)';
          status.style.color = '#4ade80';
          status.style.borderColor = '#4ade80';
        }
        numEl.style.background = '#4ade80';
        numEl.style.color = '#0f172a';
      }
    });

    const total = LESSONS.length;
    const done = completed.size;
    const pct = Math.round(done / total * 100);

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const offline = data === null;
    const bar = document.createElement('div');
    bar.style.cssText = 'max-width: 600px; margin: 30px auto 0;';
    bar.innerHTML = `
      <div style="display:flex; justify-content:space-between; color:#94a3b8; font-size:13px; margin-bottom:6px;">
        <span>📊 學習進度 ${offline ? '<span style="color:#fb923c;">（離線模式 — 進度未連線）</span>' : ''}</span>
        <span><strong style="color:#4ade80;">${done}</strong> / ${total} 課（${pct}%）</span>
      </div>
      <div style="background:#1e293b; border-radius:999px; height:12px; overflow:hidden; border:1px solid #334155;">
        <div style="background:linear-gradient(90deg,#4ade80,#38bdf8); height:100%; width:${pct}%; transition:width 0.4s;"></div>
      </div>
      ${done > 0 ? `<button id="resetProgress" style="margin-top:12px; background:transparent; color:#94a3b8; border:1px solid #334155; padding:6px 14px; border-radius:6px; font-size:12px; cursor:pointer;">↺ 重設進度</button>` : ''}
    `;
    hero.appendChild(bar);

    const resetBtn = document.getElementById('resetProgress');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (confirm('確定要清除所有學習進度嗎？')) {
          await clearAll();
          location.reload();
        }
      });
    }
  }

  // --------- 課程頁 ---------
  async function initLesson() {
    const data = await getProgress();
    const offline = data === null;
    const completed = new Set((data || []).map(p => p.lesson_id));
    const isDone = completed.has(lessonId);

    const navBtns = document.querySelector('.nav-buttons');
    if (!navBtns) return;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-top:40px; text-align:center;';
    wrap.innerHTML = `
      <button id="completeBtn" style="
        background:${isDone ? '#4ade80' : 'transparent'};
        color:${isDone ? '#0f172a' : '#4ade80'};
        border:2px solid #4ade80;
        padding:14px 32px;
        border-radius:10px;
        font-size:16px;
        font-weight:600;
        cursor:pointer;
        transition:all 0.2s;
        font-family:inherit;
        ${offline ? 'opacity:0.4; cursor:not-allowed;' : ''}
      " ${offline ? 'disabled' : ''}>
        ${isDone ? '✓ 已完成這一課（再按一次取消）' : '標記為完成 ✓'}
      </button>
      <p style="color:#94a3b8; font-size:13px; margin-top:10px;">
        ${offline
          ? '⚠️ 離線模式：請用 <code style="background:#334155;padding:2px 6px;border-radius:4px;">npm start</code> 啟動伺服器，並從 <code style="background:#334155;padding:2px 6px;border-radius:4px;">http://localhost:3000</code> 開啟'
          : '進度會儲存到 SQLite 資料庫'}
      </p>
    `;
    navBtns.parentNode.insertBefore(wrap, navBtns);

    if (offline) return;

    const btn = document.getElementById('completeBtn');
    btn.addEventListener('click', async () => {
      const willBeDone = btn.textContent.includes('標記為完成');
      try {
        if (willBeDone) {
          await markComplete(lessonId);
          btn.style.background = '#4ade80';
          btn.style.color = '#0f172a';
          btn.textContent = '✓ 已完成這一課（再按一次取消）';
        } else {
          await unmark(lessonId);
          btn.style.background = 'transparent';
          btn.style.color = '#4ade80';
          btn.textContent = '標記為完成 ✓';
        }
      } catch (e) {
        alert('儲存失敗：' + e.message);
      }
    });
  }
})();

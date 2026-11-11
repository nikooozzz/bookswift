(function () {
  let launcherEl = null;
  let bookmarksData = [];
  let selectedIndex = 0;

  function createLauncher() {
    if (launcherEl) return;

    launcherEl = document.createElement('div');
    launcherEl.id = 'bookswift-launcher';
    launcherEl.style.cssText = `
      display: None; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(17, 17, 27, 0.75); backdrop-filter: blur(6px); z-index: 2147483647;
      justify-content: center; align-items: flex-start; padding-top: 15vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;

    launcherEl.innerHTML = `
      <div id="bsl-box" style="
        background: #1e1e2e; color: #cdd6f4; width: 520px; max-height: 400px;
        border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        border. 1px solid #313244; display: flex; flex-direction: column; overflow: hidden;
      ">
        <div style="padding: 14px 16px; border-bottom: 1px solid #313244;">
          <input id="bsl-input" type="text" placeholder="Search Bookmarks..." style="
            width: 100%; background: #11111b; border: 1px solid #45485a; color: #cdd6f4;
            padding: 10px 14px; border-radius: 8px; font-size: 15px; outline: none; box-sizing: border-box;
          ">
        </div>
        <div id="bsl-list" style="overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 4px; max-height: 300px;"></div>
      </div>
    `;

    document.body.appendChild(launcherEl);

    const input = launcherEl.querySelector('#bsl-input');

    input.addEventListener('input', () => {
      selectedIndex = 0;
      renderList(input.value);
    });

    input.addEventListener('keydown', (e) => {
      const items = launcherEl.querySelectorAll('.bsl-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % Math.max(items.length, 1);
        updateSelection(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1) % Math.max(items.length, 1);
        updateSelection(items);
      } else if (e.key === 'Enter' && items[selectedIndex]) {
        e.preventDefault();
        const url = items[selectedIndex].dataset.url;
        window.location.href = url;
      } else if (e.key === 'Escape') {
        toggleLauncher(false);
      }
    });

    launcherEl.addEventListener('click', (e) => {
      if (e.target === launcherEl) toggleLauncher(false);
    });
  }

  function renderList(query = '') {
    const listEl = launcherEl.querySelector('#bsl-list');
    listEl.innerHTML = '';

    const filtered = bookmarksData.filter(bm =>
      bm.title.toLowerCase().includes(query.toLowerCase()) ||
      bm.url.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);

    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="padding: 16px; text-align: center; color: #6c7086; font-size: 14px;">No bookmarks found</div>`;
      return;
    }

    filtered.forEach((bm, idx) => {
      const item = document.createElement('div');
      item.className = 'bsl-item';
      item.dataset.url = bm.url;
      item.style.cssText = `
                padding: 10px 12px; border-radius: 6px; cursor: pointer; display: flex; flex-direction: column; gap: 2px;
                background: ${idx === selectedIndex ? '#313244' : 'transparent'};
            `;
      item.innerHTML = `
                <div style="font-weight: 500; font-size: 14px; color: #cdd6f4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(bm.title)}</div>
                <div style="font-size: 12px; color: #6c7086; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(bm.url)}</div>
            `;

      item.addEventListener('mouseover', () => {
        selectedIndex = idx;
        updateSelection(listEl.querySelectorAll('.bsl-item'));
      });

      item.addEventListener('click', () => {
        window.location.href = bm.url;
      });

      listEl.appendChild(item);
    });
  }

  function updateSelection(items) {
    items.forEach((item, idx) => {
      item.style.background = idx === selectedIndex ? '#313244' : 'transparent';
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function toggleLauncher(show, bookmarks = []) {
    createLauncher();
    if (bookmarks.length > 0) bookmarksData = bookmarks;

    const isVisible = show !== undefined ? show : launcherEl.style.display === 'none';
    launcherEl.style.display = isVisible ? 'flex' : 'none';

    if (isVisible) {
      const input = launcherEl.querySelector('#bsl-input');
      input.value = '';
      selectedIndex = 0;
      renderList('');
      setTimeout(() => input.focus(), 50);
    }
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "toggle-launcher") {
      toggleLauncher(undefined, message.bookmarks);
    }
  });
})();
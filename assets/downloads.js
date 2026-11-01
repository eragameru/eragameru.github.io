/* Счётчики скачиваний: сумма download_count файлов игры во всех выпусках GitHub (публичный API, без токена).
   Разметка: <p data-download-count="android" data-game="rubezh">Всего скачиваний: <strong>—</strong></p> */
(() => {
  'use strict';
  const MAX_AGE = 60 * 60 * 1000;
  const all = document.querySelectorAll('[data-download-count][data-game]');
  if (!all.length) return;
  (window.GAMES || []).forEach(game => {
    const nodes = Array.from(all).filter(n => n.dataset.game === game.id);
    if (!nodes.length || !game.repo) return;
    const API = `https://api.github.com/repos/${game.repo}/releases?per_page=100`;
    const KEY = 'downloads-' + game.repo;
    const FILES = {};
    (game.downloads || []).forEach(d => { FILES[d.file] = d.platform; });
    const platforms = Object.values(FILES);
    let newest = 0;

    function valid(data) {
      return data && Number.isFinite(Date.parse(data.updated_at)) &&
        platforms.every(p => Number.isSafeInteger(data[p]) && data[p] >= 0);
    }
    function render(data) {
      if (!valid(data)) return;
      const timestamp = Date.parse(data.updated_at);
      if (timestamp < newest) return;
      newest = timestamp;
      const date = new Date(data.updated_at).toLocaleString('ru-RU');
      nodes.forEach(node => {
        node.querySelector('strong').textContent = data[node.dataset.downloadCount].toLocaleString('ru-RU');
        node.title = `Все опубликованные версии. Данные GitHub на ${date}`;
      });
    }
    function cached() {
      try { return JSON.parse(localStorage.getItem(KEY)); } catch (_) { return null; }
    }
    async function get(url) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } finally { clearTimeout(timeout); }
    }
    async function refresh() {
      // резервный снимок — на случай, если GitHub ограничил число запросов
      if (game.statsFile) { try { render(await get(game.statsFile)); } catch (_) { /* остаётся «—» */ } }
      const previous = cached();
      if (valid(previous)) {
        render(previous);
        const age = Date.now() - Date.parse(previous.updated_at);
        if (age >= 0 && age < MAX_AGE) return;
      }
      try {
        const totals = { updated_at: new Date().toISOString() };
        platforms.forEach(p => { totals[p] = 0; });
        let found = false;
        for (let page = 1; ; page++) {
          if (page > 20) throw new Error('Too many release pages');
          const releases = await get(`${API}&page=${page}`);
          if (!Array.isArray(releases)) throw new Error('Unexpected API response');
          for (const release of releases) {
            if (release.draft) continue;
            if (!Array.isArray(release.assets)) throw new Error('Missing assets');
            for (const asset of release.assets) {
              const platform = FILES[asset.name];
              if (!platform) continue;
              if (!Number.isSafeInteger(asset.download_count) || asset.download_count < 0) throw new Error('Invalid count');
              totals[platform] += asset.download_count;
              found = true;
            }
          }
          if (releases.length < 100) break;
        }
        if (!found) throw new Error('No game files');
        render(totals);
        try { localStorage.setItem(KEY, JSON.stringify(totals)); } catch (_) { /* хранилище может быть выключено */ }
      } catch (_) { /* оставляем последнее известное значение, а не ложный ноль */ }
    }
    refresh();
  });
})();

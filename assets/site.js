/* ЭРАGAMERU — общая логика страниц: шапка и подвал, данные продавца, каталог игр, цены,
   кнопки скачивания, панели на странице игры и просмотр скриншотов.
   Подключается в конце <body> после data/seller.js и data/games.js. */
(() => {
  'use strict';
  const SELLER = window.SELLER || {};
  const GAMES = window.GAMES || [];
  const COMPANY = SELLER.company || 'ЭРАGAMERU';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rub = n => Number(n).toLocaleString('ru-RU') + ' ₽';
  const wordmark = () => '<span class="wm"><span class="a">ЭРА</span><span class="b">GAMERU</span></span>';
  const gameById = id => GAMES.find(g => g.id === id);
  const dlUrl = (game, file) => `https://github.com/${game.repo}/releases/latest/download/${file}`;
  const STATUS = { available: ['Доступна', 'green'], beta: ['Открытая бета', 'gold'], soon: ['Скоро', ''] };

  /* ---------- шапка: меню слева, логотип-кнопка «на главную» справа ---------- */
  const NAV = [['/#games', 'Игры'], ['/shop/', 'Магазин'], ['/support/', 'Поддержка'], ['/contacts/', 'Контакты']];
  const path = location.pathname.replace(/index\.html$/, '');
  const header = document.createElement('header');
  header.className = 'top';
  header.innerHTML = `<div class="wrap top-in">
      <button class="burger" type="button" aria-label="Меню" aria-expanded="false">☰</button>
      <nav class="nav" aria-label="Разделы сайта">${NAV.map(([href, text]) =>
        `<a href="${href}"${href !== '/#games' && path.startsWith(href) ? ' class="on" aria-current="page"' : ''}>${text}</a>`).join('')}</nav>
      <a class="brand" href="/" title="На главную" aria-label="${esc(COMPANY)} — на главную страницу">${wordmark()}<img src="/img/mark.png" alt=""></a>
    </div>`;
  document.body.prepend(header);
  const burger = $('.burger', header), nav = $('.nav', header);
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.textContent = open ? '✕' : '☰';
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); burger.textContent = '☰'; } });
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- плавные переходы между страницами ----------
     Chrome/Edge делают их сами (@view-transition в site.css). В остальных браузерах страница плавно гаснет и появляется. */
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('onpagereveal' in window) && !REDUCED) {
    document.documentElement.classList.add('page-anim');
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || a.target) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      document.documentElement.classList.add('leaving');
      setTimeout(() => { location.href = url.href; }, 170);
    });
    window.addEventListener('pageshow', () => document.documentElement.classList.remove('leaving'));
  }

  /* ---------- блоки плавно появляются при прокрутке ---------- */
  const revealer = 'IntersectionObserver' in window && !REDUCED ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      revealer.unobserve(el);
      el.classList.add('in');
      // после появления убираем служебные метки, чтобы работали обычные анимации наведения
      setTimeout(() => { el.removeAttribute('data-reveal'); el.classList.remove('in'); el.style.removeProperty('--d'); },
        900 + parseFloat(el.style.getPropertyValue('--d') || 0) * 1000);
    });
  }, { rootMargin: '0px 0px -40px 0px' }) : null;
  const REVEAL = '.card, .game-card, .shot, .steps li, .faq details, .table-scroll, .shop-game-head';
  function reveal(root) {
    if (!revealer) return;
    const groups = new Map();
    $$(REVEAL, root).forEach(el => {
      if (el.hasAttribute('data-reveal') || el.closest('.hero, .game-hero, .analytics-consent') || el.parentElement.closest('[data-reveal]')) return;
      const i = groups.get(el.parentElement) || 0;
      groups.set(el.parentElement, i + 1);
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--d', Math.min(i, 6) * 0.07 + 's');
      revealer.observe(el);
    });
  }

  /* ---------- подвал ---------- */
  const footer = document.createElement('footer');
  footer.className = 'bottom';
  footer.innerHTML = `<div class="wrap">
      <div class="foot-grid">
        <div class="foot-brand">
          <a href="/" aria-label="На главную">${wordmark()}</a>
          <p>Компьютерные и мобильные игры для Windows и Android.</p>
          <p>Продавец: <span data-seller="name"></span>, ИНН <span data-seller="inn"></span></p>
          <p>Почта: <a data-seller="email" style="display:inline"></a></p>
        </div>
        <div><h4>Сайт</h4>
          <a href="/#games">Игры</a><a href="/shop/">Магазин и цены</a><a href="/support/">Поддержка</a><a href="/contacts/">Контакты и реквизиты</a>
        </div>
        <div><h4>Документы</h4>
          <a href="/offer/">Публичная оферта</a><a href="/refund/">Правила возврата</a><a href="/privacy/">Политика конфиденциальности</a>
        </div>
      </div>
      <div class="foot-legal">
        <span>© ${new Date().getFullYear()} ${esc(COMPANY)}</span>
        <span>Оплата — через сервис ЮKassa</span>
        <button class="text-button" type="button" data-analytics-settings>Настройки аналитики</button>
      </div>
    </div>`;
  if (!document.body.hasAttribute('data-no-footer')) document.body.append(footer);

  /* ---------- данные продавца (из data/seller.js) ---------- */
  const PLACEHOLDER = { name: '[ФИО продавца]', inn: '[ИНН]', status: '[статус]', email: '[почта]' };
  $$('[data-seller]').forEach(el => {
    const key = el.getAttribute('data-seller');
    const v = String(SELLER[key] || '').trim();
    if (v) {
      el.textContent = v;
      el.classList.remove('fill');
      if (el.tagName === 'A' && key === 'email') el.href = 'mailto:' + v;
    } else {
      el.textContent = PLACEHOLDER[key] || '[…]';
      el.classList.add('fill');
    }
  });
  $$('[data-seller-row]').forEach(el => {
    if (!String(SELLER[el.getAttribute('data-seller-row')] || '').trim()) el.style.display = 'none';
  });
  $$('[data-company]').forEach(el => { el.textContent = COMPANY; });

  /* ---------- кнопки скачивания: <a data-game="rubezh" data-download-platform="windows"> ---------- */
  $$('a[data-game][data-download-platform]').forEach(a => {
    const g = gameById(a.dataset.game);
    const d = g && (g.downloads || []).find(x => x.platform === a.dataset.downloadPlatform);
    if (d) a.href = dlUrl(g, d.file);
  });

  /* ---------- каталог игр на главной ---------- */
  const catalog = $('#catalog');
  if (catalog) {
    const list = $('.games', catalog), found = $('.found', catalog), search = $('.search', catalog);
    const genreBox = $('[data-filter="genre"]', catalog), platBox = $('[data-filter="platform"]', catalog);
    const uniq = arr => Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b, 'ru'));
    const state = { q: '', genre: '', platform: '' };
    const chips = (box, key, values) => {
      box.innerHTML = `<span class="lbl">${esc(box.getAttribute('aria-label'))}:</span>` + [['', 'Все']].concat(values.map(v => [v, v]))
        .map(([v, t]) => `<button type="button" class="chip${v === '' ? ' on' : ''}" data-v="${esc(v)}">${esc(t)}</button>`).join('');
      box.addEventListener('click', e => {
        const b = e.target.closest('.chip'); if (!b) return;
        $$('.chip', box).forEach(c => c.classList.toggle('on', c === b));
        state[key] = b.dataset.v; draw();
      });
    };
    chips(genreBox, 'genre', uniq(GAMES.map(g => g.genre)));
    chips(platBox, 'platform', uniq(GAMES.flatMap(g => g.platforms || [])));
    search.addEventListener('input', () => { state.q = search.value.trim().toLowerCase(); draw(); });

    function card(g) {
      const [st, cls] = STATUS[g.status] || STATUS.available;
      return `<a class="game-card" href="${esc(g.url)}">
        <div class="cover"><img src="${esc(g.cover)}" alt="${esc(g.title)}" loading="lazy"></div>
        <span class="status badge ${cls}">${st}</span>
        <div class="body">
          <div class="title"><img src="${esc(g.icon)}" alt=""><h3>${esc(g.title)}</h3></div>
          <div class="badges"><span class="badge">${esc(g.genre)}</span>${(g.platforms || []).map(p => `<span class="badge">${esc(p)}</span>`).join('')}${g.price ? `<span class="badge green">${esc(g.price)}</span>` : ''}</div>
          <p>${esc(g.tagline)}</p>
          <span class="more">Подробнее об игре <i>→</i></span>
        </div></a>`;
    }
    function draw() {
      const items = GAMES.filter(g =>
        (!state.genre || g.genre === state.genre) &&
        (!state.platform || (g.platforms || []).includes(state.platform)) &&
        (!state.q || (g.title + ' ' + g.genre + ' ' + g.tagline).toLowerCase().includes(state.q)));
      list.innerHTML = items.map(card).join('');
      found.textContent = `Найдено игр: ${items.length} из ${GAMES.length}`;
      $('.empty', catalog).hidden = items.length > 0;
      reveal(list);
    }
    draw();
    $$('[data-stat="games"]').forEach(el => { el.textContent = GAMES.length; });
    $$('[data-stat="platforms"]').forEach(el => { el.textContent = uniq(GAMES.flatMap(g => g.platforms || [])).join(', '); });
  }

  /* ---------- таблицы цен: data-packs="rubezh" — одна игра, data-packs-all — все игры (Магазин) ---------- */
  function pricesTable(g) {
    return `<div class="table-scroll"><table class="prices">
      <thead><tr><th>Набор</th><th>Что получает игрок</th><th>Цена</th></tr></thead>
      <tbody>${(g.packs || []).map(p => `<tr><td><b>${esc(p.title)}</b></td><td>${esc(p.gets)}</td><td class="price">${rub(p.price)}</td></tr>`).join('')}</tbody>
    </table></div>`;
  }
  $$('[data-packs]').forEach(el => { const g = gameById(el.dataset.packs); if (g) el.innerHTML = pricesTable(g); });
  $$('[data-packs-all]').forEach(el => {
    el.innerHTML = GAMES.filter(g => (g.packs || []).length).map(g => `<section class="shop-game" id="${esc(g.id)}">
        <div class="shop-game-head"><img src="${esc(g.icon)}" alt=""><h2>${esc(g.title)}</h2>
          <a class="btn ghost small" href="${esc(g.url)}">Страница игры</a></div>
        ${pricesTable(g)}
      </section>`).join('') || '<p class="muted">Платных наборов пока нет.</p>';
  });

  /* ---------- панели на странице игры (переключаются без перезагрузки, адрес вида #prices) ---------- */
  const tabs = $$('.tab[aria-controls]');
  if (tabs.length) {
    // золотая подложка, которая переезжает под выбранную вкладку
    const bar = tabs[0].parentElement;
    const ind = document.createElement('span');
    ind.className = 'tab-ind';
    bar.prepend(ind);
    const moveInd = () => {
      const t = tabs.find(x => x.getAttribute('aria-selected') === 'true');
      if (t) { ind.style.left = t.offsetLeft + 'px'; ind.style.width = t.offsetWidth + 'px'; }
    };
    window.addEventListener('resize', moveInd);
    if (document.fonts) document.fonts.ready.then(moveInd);
    let current = null;
    const show = (id, scroll) => {
      const tab = tabs.find(t => t.getAttribute('aria-controls') === id) || tabs[0];
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !on;
        if (on && current !== panel) { panel.classList.remove('show'); void panel.offsetWidth; panel.classList.add('show'); }
      });
      current = document.getElementById(tab.getAttribute('aria-controls'));
      moveInd();
      if (scroll) $('.tabs').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
      bar.scrollTo({ left: tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { history.replaceState(null, '', '#' + t.getAttribute('aria-controls')); show(t.getAttribute('aria-controls')); });
      t.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        const n = tabs[(i + d + tabs.length) % tabs.length];
        n.focus(); n.click();
      });
    });
    // ссылки вида <a href="#prices"> на той же странице открывают нужную панель
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (tabs.some(t => t.getAttribute('aria-controls') === id)) { e.preventDefault(); history.replaceState(null, '', '#' + id); show(id, true); }
    });
    show(location.hash.slice(1), false);
    window.addEventListener('hashchange', () => show(location.hash.slice(1), true));
  }

  /* ---------- просмотр скриншотов ---------- */
  const shots = $$('.shot');
  if (shots.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Просмотр скриншота');
    box.innerHTML = `<figure><img alt=""><figcaption></figcaption></figure>
      <button class="lb-btn lb-close" type="button" aria-label="Закрыть">✕</button>
      <button class="lb-btn lb-prev" type="button" aria-label="Предыдущий">‹</button>
      <button class="lb-btn lb-next" type="button" aria-label="Следующий">›</button>`;
    document.body.append(box);
    let cur = 0, opener = null;
    const img = $('img', box), cap = $('figcaption', box);
    const set = s => {
      img.src = $('img', s).src;
      img.alt = $('img', s).alt;
      cap.textContent = $('figcaption', s) ? $('figcaption', s).textContent : '';
    };
    const open = i => {
      cur = (i + shots.length) % shots.length;
      const s = shots[cur];
      if (box.hidden) {
        set(s);
        box.hidden = false;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => box.classList.add('open'));
        $('.lb-close', box).focus();
      } else {
        // листание: старая картинка гаснет, новая проявляется
        img.classList.add('swap');
        setTimeout(() => { set(s); img.onload = () => img.classList.remove('swap'); if (img.complete) img.classList.remove('swap'); }, 180);
      }
    };
    const close = () => {
      box.classList.remove('open');
      setTimeout(() => { box.hidden = true; document.body.style.overflow = ''; }, 280);
      if (opener) opener.focus();
    };
    shots.forEach((s, i) => $('button', s).addEventListener('click', e => { opener = e.currentTarget; open(i); }));
    $('.lb-close', box).addEventListener('click', close);
    $('.lb-prev', box).addEventListener('click', () => open(cur - 1));
    $('.lb-next', box).addEventListener('click', () => open(cur + 1));
    box.addEventListener('click', e => { if (e.target === box) close(); });
    document.addEventListener('keydown', e => {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') open(cur - 1);
      if (e.key === 'ArrowRight') open(cur + 1);
    });
    let x0 = null;
    box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) open(cur + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  reveal(document);
})();

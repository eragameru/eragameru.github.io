/* GA4 is loaded only after the visitor allows optional analytics. */
(() => {
  'use strict';
  const ID = 'G-24NKG1SP3R';
  const KEY = 'eragameru-analytics-consent-v1';
  let enabled = false;
  function readChoice() {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  }
  function cleanPageUrl() {
    const url = new URL(location.href);
    for (const key of Array.from(url.searchParams.keys())) {
      if (!['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].includes(key)) url.searchParams.delete(key);
    }
    url.hash = '';
    return url.href;
  }
  function start() {
    if (enabled) return;
    enabled = true;
    window['ga-disable-' + ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', ID, {
      page_location: cleanPageUrl(), allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(script);
  }
  const banner = document.createElement('aside');
  banner.className = 'analytics-consent';
  banner.setAttribute('aria-label', 'Настройки аналитики');
  banner.hidden = true;
  banner.innerHTML = '<p>Разрешить аналитику? Google Analytics помогает нам понять, откуда приходят игроки и какие версии скачивают. <a href="/privacy/#analytics">Подробнее</a></p>' +
    '<div class="consent-actions"><button type="button" data-choice="accepted">Разрешить аналитику</button>' +
    '<button type="button" data-choice="declined">Без аналитики</button></div>';
  document.body.appendChild(banner);
  banner.addEventListener('click', event => {
    const button = event.target.closest('[data-choice]');
    if (!button) return;
    const choice = button.dataset.choice;
    try { localStorage.setItem(KEY, choice); } catch (_) { /* Apply for this visit. */ }
    banner.hidden = true;
    if (choice === 'accepted') start();
    else if (enabled) {
      window['ga-disable-' + ID] = true;
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
      location.reload();
    }
  });
  document.querySelectorAll('[data-analytics-settings]').forEach(button => {
    button.addEventListener('click', () => { banner.hidden = false; });
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-download-platform]');
    if (!link || !enabled || window['ga-disable-' + ID]) return;
    window.gtag('event', 'download_click', {
      game: link.dataset.game,
      download_platform: link.dataset.downloadPlatform,
      button_location: link.dataset.buttonLocation,
      link_url: link.href,
      file_name: link.href.split('/').pop(),
      transport_type: 'beacon'
    });
  });
  if (readChoice() === 'accepted') start();
  else if (readChoice() !== 'declined') banner.hidden = false;
})();

/*
 * КАТАЛОГ ИГР. Каждая игра — одна запись в списке ниже.
 * Отсюда берутся: карточки на главной, фильтры, кнопки «Скачать», цены на странице игры и в «Магазине».
 *
 * Новая игра: скопировать запись целиком, поменять поля, создать папку games/<id>/ (страница + картинки).
 *   status: "available" — доступна, "soon" — скоро (карточка без кнопок скачивания), "beta" — бета-тест
 *   repo:   хранилище GitHub, из последнего выпуска которого скачиваются файлы игры
 *   packs:  платные наборы. Цены и состав ДОЛЖНЫ совпадать с сервером игры (для «Рубежа» — Server/yc/pay.js, PACKS)
 */
window.GAMES = [
  {
    id: "rubezh",
    title: "РУБЕЖ",
    url: "/games/rubezh/",
    icon: "/games/rubezh/img/icon.png",
    cover: "/games/rubezh/img/cover.jpg",
    genre: "Стратегия",
    platforms: ["Windows", "Android"],
    status: "beta",
    age: "12+",
    price: "Бесплатно",
    tagline: "Стратегия на линии: стройте здания, ведите войска по парящим островам и разрушьте вражеский кристалл раньше, чем враг — ваш.",
    repo: "erick2112d/rubezh-game",
    statsFile: "/data/download-stats.json",
    downloads: [
      { platform: "windows", label: "Скачать для Windows", file: "Rubezh_Windows.zip", note: "Windows 10/11, 64-бит" },
      { platform: "android", label: "Скачать для Android", file: "Rubezh.apk", note: "Android 8.0 и новее" }
    ],
    currency: "кристаллы",
    packs: [
      { id: "gems80",   title: "80 кристаллов",      gets: "80 кристаллов",                                   price: 99,   icon: "💎",  size: 1 },
      { id: "gems500",  title: "500 кристаллов",     gets: "500 кристаллов",                                  price: 449,  icon: "💎",  size: 2 },
      { id: "gems1200", title: "1200 кристаллов",    gets: "1200 кристаллов",                                 price: 899,  icon: "💎",  size: 3 },
      { id: "gems2500", title: "2500 кристаллов",    gets: "2500 кристаллов",                                 price: 1690, icon: "💎",  size: 4 },
      { id: "hero",     title: "Набор героя",        gets: "1200 кристаллов и Магический сундук с картами",   price: 499,  icon: "🎁",  tag: "Выгодно" },
      { id: "passplus", title: "Боевой пропуск +",   gets: "Вторая ветка наград боевого пропуска и 4 дополнительных задания в день до конца текущего сезона (сезон — календарный месяц)", price: 299, icon: "🎟️" }
    ]
  }
];

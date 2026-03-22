const CACHE_NAME = 'baby-flashcard-v3';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/dot-card.css',
  './css/flash-player.css',
  './css/tv.css',
  './js/app.js',
  './js/dot-card.js',
  './js/flash-player.js',
  './js/tv-remote.js',
  './js/data/chapters.js',
  './js/data/chapter7.js',
  './manifest.json'
];

// 安装 - 缓存所有资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// 拦截请求 - 优先使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

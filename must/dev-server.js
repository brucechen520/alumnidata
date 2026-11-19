/*
 * 本機開發伺服器（issue 003）：Parcel 1 沒有內建 proxy 設定，這裡用 Parcel 的 middleware
 * 加上 http-proxy-middleware，把 /ee/ 開頭的請求轉給本機 PHP（docker compose 的 web 服務）。
 * 前端與 API 因此同源，session cookie 與 XSRF-TOKEN 都能正常帶上，不需要 CORS。
 *
 *   npm run dev                         # http://localhost:1234 ，API 轉給 http://localhost:8080
 *   EE_API_TARGET=http://localhost:9000 PORT=3000 npm run dev
 */
const http = require('http');
const Bundler = require('parcel-bundler');
const { createProxyMiddleware } = require('http-proxy-middleware');

const target = process.env.EE_API_TARGET || 'http://localhost:8080';
const port = Number(process.env.PORT || 1234);

const bundler = new Bundler(['index.html', 'login.html', 'member.html'], {});
const parcel = bundler.middleware();
// changeOrigin: false 保留瀏覽器送出的 Host（localhost:1234），PHP 的來源檢查才會視為同源
const proxy = createProxyMiddleware('/ee', { target, changeOrigin: false, logLevel: 'warn' });

http.createServer((req, res) => {
  // The legacy PHP entry redirects to the production login URL.
  if (req.url === '/') req.url = '/index.html';
  if (req.url.startsWith('/ee/Frontend/')) req.url = req.url.replace('/ee/Frontend/', '/');
  if (req.url.startsWith('/ee/')) return proxy(req, res, () => parcel(req, res));
  parcel(req, res);
})
  .listen(port, () => {
    console.log(`開發伺服器：http://localhost:${port}（/ee/ 轉給 ${target}）`);
  });

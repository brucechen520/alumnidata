// 與 PHP date('Y/m/d H:i:s') 在 Asia/Taipei 的輸出一致，不受瀏覽器時區影響
export function formatTime(ts) {
  const d = new Date(Number(ts) * 1000);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Taipei', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(d).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  const hour = parts.hour === '24' ? '00' : parts.hour;
  return `${parts.year}/${parts.month}/${parts.day} ${hour}:${parts.minute}:${parts.second}`;
}

export function errorText(error, fallback) {
  return error && error.response && error.response.data && error.response.data.message || fallback;
}

export const classNames = ['', '甲', '乙', '丙', '丁'];

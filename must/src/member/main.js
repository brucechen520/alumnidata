import Vue from 'vue';
import { ready } from '../shared/http';

ready().catch(() => {});

new Vue({
  el: '#app',
  render: h => h('main', [
    h('h1', '會員系統'),
    h('p', '會員系統首頁建置中。'),
    h('a', { attrs: { href: '/ee/main.php' } }, '進入目前會員系統')
  ])
});

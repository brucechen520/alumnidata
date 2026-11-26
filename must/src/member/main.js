import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { ready } from './api';
import { BootstrapVue } from 'bootstrap-vue';
import { install as installDialog } from '../shared/dialog';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(BootstrapVue);
Vue.use({ install: installDialog });

// 舊會員系統的樣式與圖片沿用原檔（與 login.html 一樣在執行時載入同源檔案）
['/ee/css/mysy.css', '/ee/css/visual4tab.css', '/ee/css/gmail.css'].forEach(href => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
});

Vue.config.ignoredElements = ['marquee'];

ready().catch(() => {}).then(() => {
  new Vue({ el: '#app', router, render: h => h(App) });
});

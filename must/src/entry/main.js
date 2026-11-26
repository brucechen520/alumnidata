import Vue from 'vue';
import Entry from './Entry.vue';
import { BootstrapVue } from 'bootstrap-vue';
import { install as installDialog } from '../shared/dialog';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(BootstrapVue);
Vue.use({ install: installDialog });

new Vue({ el: '#app', render: h => h(Entry) });

import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from './views/Home.vue';
import MessageDetail from './views/MessageDetail.vue';
import BasicData from './views/BasicData.vue';
import AdvancedData from './views/AdvancedData.vue';
import ExperienceData from './views/ExperienceData.vue';
import Directory from './views/Directory.vue';
import Profile from './views/Profile.vue';
import Statistics from './views/Statistics.vue';
import Board from './views/Board.vue';
import Instruction from './views/Instruction.vue';

Vue.use(VueRouter);

// hash 模式：不需伺服器改寫網址；舊網址對應見 docs/technical-notes.md
export default new VueRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: Home },
    { path: '/message/:id', component: MessageDetail },
    { path: '/basic', component: BasicData },
    { path: '/advanced', component: AdvancedData },
    { path: '/experience', component: ExperienceData },
    { path: '/directory', component: Directory },
    { path: '/profile/:id', component: Profile },
    { path: '/statistics', component: Statistics },
    { path: '/board', component: Board },
    { path: '/instruction', component: Instruction },
    { path: '*', redirect: '/' }
  ]
});

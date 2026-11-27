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
import AdminFrame from './views/admin/AdminFrame.vue';
import MailSingle from './views/admin/MailSingle.vue';
import MailGroup from './views/admin/MailGroup.vue';
import MailJobs from './views/admin/MailJobs.vue';
import MailJobNew from './views/admin/MailJobNew.vue';
import MailJobDetail from './views/admin/MailJobDetail.vue';
import MailTemplates from './views/admin/MailTemplates.vue';
import MessagePost from './views/admin/MessagePost.vue';
import ConfirmMembers from './views/admin/ConfirmMembers.vue';
import MarqueeSet from './views/admin/MarqueeSet.vue';
import ChangeLog from './views/admin/ChangeLog.vue';
import UpdateFile from './views/admin/UpdateFile.vue';
import SqlCheck from './views/admin/SqlCheck.vue';

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
    // 後台管理（issue 006）：外層元件在非管理員時只顯示權限不足，不載入任何子頁
    {
      path: '/admin', component: AdminFrame, children: [
        { path: 'mail-single', component: MailSingle },
        { path: 'mail', component: MailGroup },
        // 寄信功能（issue 016）：寄件記錄 → 建立新寄信／任務詳情
        { path: 'mail-jobs', component: MailJobs },
        { path: 'mail-jobs/new', component: MailJobNew },
        { path: 'mail-jobs/:key', component: MailJobDetail },
        { path: 'mail-templates', component: MailTemplates },
        { path: 'message-post', component: MessagePost },
        { path: 'confirm', component: ConfirmMembers },
        { path: 'marquee', component: MarqueeSet },
        { path: 'change-log', component: ChangeLog },
        { path: 'update-file', component: UpdateFile },
        { path: 'sql-check', component: SqlCheck }
      ]
    },
    { path: '*', redirect: '/' }
  ]
});

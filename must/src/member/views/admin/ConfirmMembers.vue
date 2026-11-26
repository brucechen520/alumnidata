<template>
  <div>
    <h1 align="center">{{ title }}</h1>
    <select id="select" v-model="part" style="width: 200px; height: 40px">
      <option value="5">請選擇</option>
      <option v-for="l in levels" :key="l.value" :value="String(l.value)">{{ l.label }}</option>
    </select>
    <p v-if="error">{{ error }}</p>
    <table border="1">
      <tbody>
        <tr align="center">
          <td></td><td>會員編號</td><td>姓名</td><td>級別</td><td>FB</td><td>Mail</td><td>申請時間</td>
          <td><a href="#" @click.prevent="toggleSort">最後登入</a></td><td>目前權限</td><td>修改</td><td>新權限</td><td></td>
        </tr>
        <tr v-for="(m, i) in shown" :key="m.id" align="center">
          <td>{{ i + 1 }}</td>
          <td>{{ m.id }}</td>
          <td><router-link :to="'/profile/' + m.id">{{ m.name }}</router-link></td>
          <td>{{ m.level }}</td>
          <td><a v-if="m.fbId" :href="'http://www.facebook.com/' + m.fbId" target="_blank" rel="noopener">{{ m.fbName }}</a><template v-else>{{ m.fbName }}</template></td>
          <td>{{ m.email }}</td>
          <td>{{ m.createTime ? time(m.createTime) : '-' }}</td>
          <td>{{ m.loginTime ? time(m.loginTime) : '-' }}</td>
          <td>{{ m.confirmDesc }}</td>
          <td><label><input v-model="checked" type="checkbox" :value="m.id">修改</label></td>
          <td>
            <select v-model="newLevel[m.id]">
              <option value="">請選擇</option>
              <option v-for="l in levels" :key="l.value" :value="String(l.value)">{{ l.label }}</option>
            </select>
          </td>
          <td><input v-if="(i + 1) % 10 === 0 || i === 0" type="button" value="送出" :disabled="busy" @click="submit"></td>
        </tr>
      </tbody>
    </table>
    Member{{ shown.length }}
  </div>
</template>

<script>
import { adminApi } from '../../api';
import { formatTime, errorText } from '../../util';

const titles = { '-1': '封鎖會員管理頁面', '0': '未認證管理頁面', '1': '一般會員管理頁面', '2': '進階會員管理頁面', '3': '分享會員管理頁面', '4': '管理者管理頁面' };

export default {
  data() { return { levels: [], members: [], part: '5', newLevel: {}, checked: [], byLogin: true, busy: false, error: '' }; },
  computed: {
    title() { return titles[this.part] || '待認證管理頁面'; },
    shown() { return this.part === '5' ? this.members : this.members.filter(m => String(m.confirm) === this.part); }
  },
  created() { this.load(); },
  methods: {
    time: formatTime,
    async load() {
      try {
        // 選單進入時舊連結為 Confirm&L=1（依最後登入排序）
        const data = (await adminApi.members(this.byLogin ? 'login' : '')).data;
        this.levels = data.levels; this.members = data.members; this.checked = [];
        // 每列的新權限初始為「請選擇」（與舊頁相同）；先建立所有鍵，v-model 才會有初始選項
        this.newLevel = data.members.reduce((o, m) => { o[m.id] = ''; return o; }, {}); this.error = '';
      } catch (error) { this.error = errorText(error, '無法讀取會員資料。'); }
    },
    toggleSort() { this.byLogin = true; this.load(); },
    async submit() {
      // 只送出有勾選「修改」且選了新權限的會員，與舊頁面相同
      const changes = this.checked.filter(id => this.newLevel[id] !== undefined && this.newLevel[id] !== '')
        .map(id => ({ id, confirm: Number(this.newLevel[id]) }));
      if (!changes.length) return;
      this.busy = true;
      try { await adminApi.setConfirm(changes); await this.load(); }
      catch (error) { await this.$dialog.alert(errorText(error, '更新權限失敗，請稍後再試。')); }
      finally { this.busy = false; }
    }
  }
};
</script>

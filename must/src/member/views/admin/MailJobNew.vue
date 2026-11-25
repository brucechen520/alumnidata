<template>
  <div class="mail-new">
    <!-- 步驟一：撰寫信件 -->
    <form v-if="step === 1" @submit.prevent="next">
      <p><input type="button" value="返回寄件記錄" @click="$router.push('/admin/mail-jobs')"></p>
      <h3>建立新寄信　步驟一：撰寫信件</h3>
      <table border="1" class="table">
        <tr>
          <td><p>主旨</p></td>
          <td><input v-model="topic" type="text" size="80" maxlength="100"></td>
        </tr>
        <tr>
          <td><p>內文</p></td>
          <td><textarea v-model="content" cols="70" rows="15"></textarea></td>
        </tr>
        <tr>
          <td><p>個人化欄位</p></td>
          <td>
            主旨與內文可使用 <code>{{ placeholders.join('、') }}</code>，寄送時會換成每位收件人的資料。<br>
            <code>{畢業級別}</code> 已含學制與「級」字（例如 <code>大學100級</code>；多重學籍為 <code>大學100級/碩士102級</code>），後面不用再加「級」。
            <p v-if="unsupported.length" class="warn">不支援的欄位：{{ unsupported.join('、') }}</p>
          </td>
        </tr>
        <tr>
          <td><p>代換預覽</p></td>
          <td class="preview">
            <small>以範例系友「{{ sample.name }}、{{ sample.level }}、{{ sample.email }}」代換：</small>
            <div><strong>主旨：</strong>{{ render(topic) }}</div>
            <pre>{{ previewBody }}</pre>
          </td>
        </tr>
        <tr>
          <td colspan="2"><input type="submit" value="下一步：選擇收件人">
            <input type="button" value="重新輸入" @click="topic = content = ''"></td>
        </tr>
      </table>
    </form>

    <!-- 步驟二：選擇收件人與附件 -->
    <div v-else>
      <p><input type="button" value="回到步驟一" :disabled="busy" @click="step = 1"></p>
      <h3>建立新寄信　步驟二：選擇收件人與附件</h3>
      <div class="pos_fixed">已選取人數({{ selectedCount }})</div>
      <p v-if="error" class="warn">{{ error }}</p>
      <p v-if="budget">
        目前每日可寄 {{ budget.daily }} 封（收件人預算 {{ budget.dailyRecipients }}、信件預算 {{ budget.dailyMessages }}，今日剩餘約 {{ budget.remaining }} 封），
        前方排隊尚有 {{ queuedAhead }} 位未寄，本任務 {{ selectedCount }} 位，{{ estimateText }}。
      </p>
      ●點選畢業級別欄位可全選該級別所有成員
      <table border="1">
        <tbody>
          <tr><td>No.</td><td>畢業級別</td><td>姓名</td><td>FB暱稱</td><td>信箱</td><td>會員註冊時間</td>
            <td><a href="#" @click.prevent="toggleSort">最後登入</a></td><td>目前權限</td></tr>
          <tr v-for="r in recipients" :key="r.no">
            <td>{{ r.no }}</td>
            <td><span v-if="!byLogin" class="level" @click="toggleLevel(r.level)">{{ r.level }}</span><template v-else>{{ r.level }}</template></td>
            <td>{{ r.name }}</td>
            <td><a :href="'http://www.facebook.com/' + r.fbId" target="_blank" rel="noopener">{{ r.fbName }}</a></td>
            <td :class="{ invalid: !r.emailValid, checked: isChecked(r) }"><label><input v-model="selected" type="checkbox" :value="r.no" :disabled="!r.emailValid">{{ r.email }}</label> <strong v-if="!r.emailValid">信箱格式錯誤</strong></td>
            <td>{{ r.createTime ? date(r.createTime) : '' }}</td>
            <td>{{ r.loginTime ? time(r.loginTime) : '' }}</td>
            <td>{{ r.confirmDesc }}</td>
          </tr>
        </tbody>
      </table>
      <p>
        <input type="button" value="建立寄信任務" :disabled="busy" @click="submit">
        ({{ selectedCount }})
        <input type="button" value="清除" @click="selected = []">
        <input type="button" value="全選" @click="selected = recipients.filter(r => r.emailValid).map(r => r.no)">
        夾帶檔案（上限 5 MB）
        <input ref="file" type="file" @change="file = $event.target.files[0] || null">
      </p>
      <p v-if="busy">建立中……</p>
    </div>
  </div>
</template>

<script>
import { adminApi } from '../../api';
import { formatTime, errorText } from '../../util';

const PLACEHOLDERS = ['{姓名}', '{畢業級別}', '{信箱}'];
const MAX_BYTES = 5 * 1024 * 1024;

export default {
  data() {
    return {
      step: 1, topic: '', content: '', recipients: [], jobKey: '', budget: null, queuedAhead: 0,
      file: null, selected: [], byLogin: false, busy: false, error: '',
      placeholders: PLACEHOLDERS,
      sample: { name: '王小明', level: '大學100級/碩士102級', email: 'example@fcu.edu.tw' }
    };
  },
  computed: {
    selectedCount() { return this.selected.length; },
    unsupported() {
      const found = (this.topic + '\n' + this.content).match(/\{[^{}]*\}/g) || [];
      return found.filter((p, i) => PLACEHOLDERS.indexOf(p) === -1 && found.indexOf(p) === i);
    },
    previewBody() {
      const text = this.render(this.content);
      return text.length > 300 ? text.slice(0, 300) + '……' : text;
    },
    estimate() {
      // 與後端 mail_jobs_estimate() 相同：Q＋M ≤ R 今日內寄完，否則 ceil((Q＋M−R)／N)＋1 天
      if (!this.budget) return null;
      const r = this.budget.remaining, n = Math.max(1, this.budget.daily), q = this.queuedAhead, m = this.selectedCount;
      if (q + m <= r) return { today: true, days: 1 };
      return { today: false, days: Math.ceil((q + m - r) / n) + 1 };
    },
    estimateText() {
      const e = this.estimate;
      if (!e) return '';
      return e.today ? '預計今日內寄完' : '預計約 ' + e.days + ' 天寄完（含今天）';
    }
  },
  methods: {
    date(ts) { return formatTime(ts).slice(0, 10); },
    time: formatTime,
    render(text) {
      return text.split('{姓名}').join(this.sample.name).split('{畢業級別}').join(this.sample.level).split('{信箱}').join(this.sample.email);
    },
    isChecked(r) { return this.selected.indexOf(r.no) !== -1; },
    next() {
      if (this.topic.trim() === '') { alert('未輸入主旨'); return; }
      if (this.content.trim() === '') { alert('未輸入內文'); return; }
      if (this.unsupported.length) { alert('不支援的欄位：' + this.unsupported.join('、')); return; }
      this.step = 2;
      if (!this.recipients.length) this.load();
    },
    async load() {
      try {
        const data = (await adminApi.mailJobRecipients(this.byLogin ? 'login' : '')).data;
        this.recipients = data.recipients; this.jobKey = data.jobKey; this.budget = data.budget;
        this.queuedAhead = data.queuedAhead; this.selected = []; this.error = '';
      } catch (error) { this.error = errorText(error, '無法讀取收件人清單。'); }
    },
    toggleSort() { this.byLogin = !this.byLogin; this.load(); },
    toggleLevel(level) {
      const nos = this.recipients.filter(r => r.level === level && r.emailValid).map(r => r.no);
      const all = nos.every(n => this.selected.indexOf(n) !== -1);
      this.selected = this.selected.filter(n => nos.indexOf(n) === -1).concat(all ? [] : nos);
    },
    async submit() {
      // 依清單順序送出會員序號；同一會員可能同時出現在學士與在職兩組，伺服器端會依信箱去重
      const ids = [];
      this.recipients.forEach(r => { if (this.isChecked(r) && ids.indexOf(r.id) === -1) ids.push(r.id); });
      if (!ids.length) { alert('請選擇收件人'); return; }
      if (this.file && this.file.size > MAX_BYTES) { alert('附件過大（上限 5 MB）。'); return; }
      const lines = [
        '主旨：' + this.topic,
        '收件人數：' + ids.length + ' 位',
        '附件：' + (this.file ? this.file.name : '無'),
        '預估：前方排隊 ' + this.queuedAhead + ' 位，' + this.estimateText,
        '',
        '建立後將由系統背景排程自動寄出，確定建立？'
      ];
      if (!confirm(lines.join('\n'))) return;
      const data = new FormData();
      data.append('jobKey', this.jobKey);
      data.append('topic', this.topic);
      data.append('content', this.content);
      data.append('members', JSON.stringify(ids));
      if (this.file) data.append('uploaded_file', this.file);
      this.busy = true; this.error = '';
      try {
        const result = (await adminApi.mailJobCreate(data)).data;
        if (result.skipped && result.skipped.length) {
          alert('以下 ' + result.skipped.length + ' 位信箱空白或格式錯誤，未加入任務：\n' + result.skipped.map(s => s.name + ' ' + s.email).join('\n'));
        }
        this.$router.push({ path: '/admin/mail-jobs/' + result.jobKey, query: { created: '1' } });
      } catch (error) {
        // 同一個任務識別重送不會建立第二個任務；連線中斷時可直接再按一次
        this.error = errorText(error, '建立寄信任務失敗，請稍後再試（再按一次不會重複建立）。');
      } finally { this.busy = false; }
    }
  }
};
</script>

<style scoped>
.warn { color: #a40000; }
.preview pre { white-space: pre-wrap; margin: 4px 0 0; font-family: inherit; }
.pos_fixed { background-color: rgba(255, 0, 255, .5); position: fixed; bottom: 50px; right: 10px; font-size: 36px; }
.level { cursor: pointer; }
.invalid { background: #fff0f0; color: #a40000; }
.checked { background: #9999ff; }
</style>

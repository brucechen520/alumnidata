<template>
  <div>
    <!-- 步驟一：主旨與內文（舊 Mailer.php） -->
    <form v-if="step === 1" id="myform" name="myform" @submit.prevent="next">
      多人寄信功能放這
      <center>
        <div class="sexyborder">
          <table border="1" class="table">
            <tr>
              <td><p>主旨</p></td>
              <td class="td"><input v-model="topic" name="topic" type="text" size="80" maxlength="100"></td>
            </tr>
            <tr>
              <td><p>內文</p></td>
              <td><textarea v-model="content" name="content" cols="60" rows="15"></textarea></td>
            </tr>
            <tr>
              <td colspan="2"><br><input type="submit" name="Submit" value="送出">
                <input type="button" name="reset" value="重新輸入" @click="topic = content = ''"></td>
            </tr>
          </table>
        </div>
      </center>
    </form>

    <!-- 步驟二：選擇收件人、附件並寄出（舊 SendMailer.php） -->
    <div v-else>
      <div class="pos_fixed">已選取人數({{ selectedCount }})</div>
      <p v-if="error">{{ error }}</p>
      <template v-if="result">
        <p><strong>{{ resultText }}</strong></p>
        <table border="1" class="result">
          <tr><td>批次</td><td>收件人數</td><td>狀態</td><td>說明</td></tr>
          <tr v-for="b in result.batches" :key="b.batch">
            <td>{{ b.batch }}</td><td>{{ b.recipients }}</td><td>{{ statusText(b.status) }}</td><td>{{ b.error }}</td>
          </tr>
        </table>
        <p v-if="result.unknown">結果未明的批次可能已經寄出（BCC 信件的收件人欄為系友會信箱，請至該信箱核對），系統不會自動重送，也不會繼續寄送其後尚未寄出的批次。請核對後按「重新開始（新的提交）」，只勾選確定尚未收到的收件人。</p>
        <p>提交識別：{{ result.jobId }}</p>
        <p>
          <input v-if="!result.complete && !result.unknown && (result.failed || result.pending)" type="button" value="重送未完成的批次" :disabled="busy" @click="send">
          <input type="button" value="重新開始（新的提交）" :disabled="busy" @click="restart">
        </p>
      </template>
      <template v-else>
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
              <td :style="{ background: isChecked(r) ? '#9999FF' : 'white' }"><label><input v-model="selected" type="checkbox" :value="r.no">{{ r.email }}</label></td>
              <td>{{ r.createTime ? date(r.createTime) : '' }}</td>
              <td>{{ r.loginTime ? time(r.loginTime) : '' }}</td>
              <td>{{ r.confirmDesc }}</td>
            </tr>
          </tbody>
        </table>
        <input type="button" value="送出" :disabled="busy" @click="send">
        ({{ selectedCount }})
        <input type="button" value="清除" @click="selected = []">
        <input type="button" value="全選" @click="selected = recipients.map(r => r.no)">
        夾帶檔案
        <input ref="file" type="file" @change="file = $event.target.files[0] || null">選擇檔案後請等待上傳完成(出現檔名)
        <p v-if="busy">寄送中，請勿關閉或重新整理頁面……</p>
      </template>
    </div>
  </div>
</template>

<script>
import { adminApi } from '../../api';
import { formatTime, errorText } from '../../util';

export default {
  data() {
    return { step: 1, topic: '', content: '', recipients: [], jobId: '', file: null, selected: [], byLogin: false, busy: false, error: '', result: null };
  },
  computed: {
    selectedCount() { return this.selected.length; },
    resultText() {
      const r = this.result;
      if (r.complete) return 'Mail were Sent!（共 ' + r.total + ' 批全部寄出）';
      return '部分完成：共 ' + r.total + ' 批，已寄出 ' + r.sent + ' 批，失敗 ' + r.failed + ' 批，結果未明 ' + r.unknown + ' 批，尚未寄送 ' + r.pending + ' 批。';
    }
  },
  methods: {
    date(ts) { return formatTime(ts).slice(0, 10); },
    time: formatTime,
    statusText(s) { return { sent: '已寄出', failed: '失敗（可重送）', unknown: '結果未明', pending: '尚未寄送' }[s] || s; },
    isChecked(r) { return this.selected.indexOf(r.no) !== -1; },
    async load() {
      try {
        const data = (await adminApi.mailRecipients(this.byLogin ? 'login' : '')).data;
        this.recipients = data.recipients; this.jobId = data.jobId; this.selected = []; this.error = '';
      } catch (error) { this.error = errorText(error, '無法讀取收件人清單。'); }
    },
    next() {
      if (this.topic === '') { alert('未輸入主題'); return; }
      if (this.content === '') { alert('未輸入內容'); return; }
      this.step = 2; this.file = null; this.load();
    },
    toggleSort() { this.byLogin = !this.byLogin; this.result = null; this.file = null; this.load(); },
    toggleLevel(level) {
      // 與舊頁面相同：該級別尚未全選就全選，已全選則全部取消
      const nos = this.recipients.filter(r => r.level === level).map(r => r.no);
      const all = nos.every(n => this.selected.indexOf(n) !== -1);
      this.selected = this.selected.filter(n => nos.indexOf(n) === -1).concat(all ? [] : nos);
    },
    async send() {
      const chosen = this.recipients.filter(r => this.isChecked(r)).map(r => r.email);
      if (!chosen.length) { alert('請選擇收件人'); return; }
      const data = new FormData();
      data.append('jobId', this.jobId);
      data.append('topic', this.topic);
      data.append('content', this.content);
      data.append('person', JSON.stringify(chosen));
      // 附件存在元件狀態：結果畫面沒有檔案欄位，重送失敗批次時仍須帶同一個附件
      if (this.file) data.append('uploaded_file', this.file);
      this.busy = true; this.error = '';
      try {
        this.result = (await adminApi.mailSend(data)).data;
      } catch (error) {
        if (error.response) {
          this.error = errorText(error, '寄信失敗，請稍後再試。');
        } else {
          // 連線中斷或逾時：伺服器可能仍在寄送，以提交識別查詢逐批結果，不要直接重按送出
          await this.recover();
        }
      } finally { this.busy = false; }
    },
    async recover() {
      this.error = '連線中斷或逾時，信件可能仍在寄送。以下為目前查到的逐批結果；請先核對，勿直接重新送出。';
      try { this.result = (await adminApi.mailJob(this.jobId)).data; }
      catch (e) { this.error += '（尚無法查到結果，請稍後重新整理此頁並至系友會信箱核對。）提交識別：' + this.jobId; }
    },
    restart() { this.result = null; this.error = ''; this.file = null; this.load(); }
  }
};
</script>

<style scoped>
.sexyborder { border: 1px solid #0066cc; padding: 5px; border-radius: 5px; }
.pos_fixed { background-color: rgba(255, 0, 255, .5); position: fixed; bottom: 50px; right: 10px; font-size: 36px; }
.level { cursor: pointer; }
.result td { padding: 2px 8px; }
</style>

<template>
  <div class="mail-job">
    <p><input type="button" value="返回寄件記錄" @click="$router.push('/admin/mail-jobs')"></p>
    <p v-if="created" class="notice">任務已建立，系統將於背景寄送，可以關閉本頁。</p>
    <p v-if="error" class="warn">{{ error }}</p>
    <template v-if="job">
      <table border="1" class="info">
        <tr><td>主旨</td><td>{{ job.subject }}</td></tr>
        <tr><td>內文</td><td><pre>{{ job.body }}</pre></td></tr>
        <tr><td>附件</td><td>
          <template v-if="job.attachmentName">{{ job.attachmentName }}<span v-if="!job.attachmentAvailable">（附件檔已清除）</span></template>
          <template v-else>無</template>
        </td></tr>
        <tr><td>建立者／時間</td><td>{{ job.createdBy }}　{{ minute(job.createdAt) }}</td></tr>
        <tr><td>狀態</td><td>
          {{ job.statusLabel }}<template v-if="job.resumeAt">（預計 {{ minute(job.resumeAt) }} 恢復）</template>
          <template v-if="job.cancelledAt">　{{ job.cancelledBy }} 於 {{ minute(job.cancelledAt) }} 停止</template>
          <template v-if="job.abandonedAt">　已於 {{ minute(job.abandonedAt) }} 放棄重排失敗收件人</template>
        </td></tr>
        <tr><td>進度</td><td>
          <div class="bar"><div class="fill" :style="{ width: percent + '%' }"></div></div>
          已寄出 {{ job.counts.sent }}/{{ job.total }}
          （尚未寄送 {{ job.counts.pending }}、寄送中 {{ job.counts.sending }}、失敗 {{ job.counts.failed }}、結果未明 {{ job.counts.unknown }}、已取消 {{ job.counts.cancelled }}）
        </td></tr>
      </table>
      <p>
        <input v-if="job.canCancel" type="button" value="停止寄信（取消任務）" :disabled="busy" @click="cancel">
        <input v-if="job.canRequeue" type="button" value="重新排入失敗收件人" :disabled="busy" @click="requeue">
        <input v-if="job.canAbandon" type="button" value="放棄重排失敗收件人（清除附件）" :disabled="busy" @click="abandon">
        <input type="button" value="重新整理" :disabled="busy" @click="load">
      </p>
      <p v-if="job.counts.failed && job.attachmentName && !job.attachmentAvailable" class="warn">附件檔已不存在，無法重新排入失敗收件人；如需補寄請建立新的寄信任務。</p>
      <p v-if="job.counts.unknown" class="warn">「結果未明」表示信件可能已經寄出，系統不會自動重寄，請至寄件信箱的寄件備份核對。</p>
      <p>
        篩選狀態：
        <select v-model="filter">
          <option value="">全部（{{ recipients.length }}）</option>
          <option v-for="(label, key) in labels" :key="key" :value="key">{{ label }}（{{ countOf(key) }}）</option>
        </select>
      </p>
      <table border="1" class="rows">
        <tr><td>#</td><td>姓名</td><td>畢業級別</td><td>信箱</td><td>狀態</td><td>寄出時間</td><td>失敗原因</td></tr>
        <tr v-for="r in shown" :key="r.seq">
          <td>{{ r.seq }}</td><td>{{ r.name }}</td><td>{{ r.level }}</td><td>{{ r.email }}</td>
          <td :class="'st-' + r.status">{{ labels[r.status] || r.status }}</td>
          <td>{{ r.sentAt ? time(r.sentAt) : '' }}</td>
          <td>{{ r.status === 'sent' ? '' : r.error }}</td>
        </tr>
      </table>
    </template>
  </div>
</template>

<script>
import { adminApi } from '../../api';
import { formatTime, errorText } from '../../util';

export default {
  data() {
    return {
      job: null, recipients: [], filter: '', error: '', busy: false, timer: null,
      created: this.$route.query.created === '1',
      labels: { pending: '尚未寄送', sending: '寄送中', sent: '已寄出', failed: '失敗', unknown: '結果未明', cancelled: '已取消' }
    };
  },
  computed: {
    shown() { return this.filter ? this.recipients.filter(r => r.status === this.filter) : this.recipients; },
    percent() { return this.job && this.job.total ? Math.round(this.job.counts.sent * 100 / this.job.total) : 0; }
  },
  created() {
    this.load();
    // 開啟時每 30 秒自動更新進度
    this.timer = setInterval(() => { if (!this.busy) this.load(); }, 30000);
  },
  beforeDestroy() { clearInterval(this.timer); },
  watch: { '$route.params.key'() { this.job = null; this.load(); } },
  methods: {
    minute(ts) { return formatTime(ts).slice(0, 16); },
    time: formatTime,
    countOf(status) { return this.recipients.filter(r => r.status === status).length; },
    async load() {
      try {
        const data = (await adminApi.mailJobDetail(this.$route.params.key)).data;
        this.job = data.job; this.recipients = data.recipients; this.error = '';
      } catch (error) {
        this.error = errorText(error, '無法讀取寄信任務。');
      }
    },
    async act(action, okText) {
      this.busy = true;
      try {
        await adminApi.mailJobAction(action, this.job.jobKey);
        if (okText) await this.$dialog.alert(okText);
      } catch (error) {
        await this.$dialog.alert(errorText(error, '操作失敗，請稍後再試。'));
      } finally {
        this.busy = false;
        await this.load();
      }
    },
    async cancel() {
      const c = this.job.counts;
      const msg = '將取消尚未寄送的 ' + c.pending + ' 位，已寄出的 ' + c.sent + ' 位不受影響'
        + '（若剛好有 1 封正在寄送中，仍可能寄出）。確定要停止寄信嗎？';
      if (await this.$dialog.confirm(msg, { danger: true, okText: '停止寄信' })) await this.act('cancel', '已停止寄信。');
    },
    async requeue() {
      const msg = '將重新排入 ' + this.job.counts.failed + ' 位失敗的收件人，由背景排程依額度寄出'
        + (this.job.attachmentName ? '（會附上原附件）' : '') + '。確定嗎？';
      if (await this.$dialog.confirm(msg)) await this.act('requeue_failed', '已重新排入。');
    },
    async abandon() {
      if (await this.$dialog.confirm('放棄後將清除這個任務的附件檔，之後無法再重新排入失敗收件人。確定放棄嗎？', { danger: true, okText: '放棄重排' })) await this.act('abandon_failed', '已放棄重排並清除附件。');
    }
  }
};
</script>

<style scoped>
.warn { color: #a40000; }
.notice { background: #e8f5e9; padding: 4px 8px; }
.info td, .rows td { padding: 2px 8px; }
.info pre { white-space: pre-wrap; margin: 0; font-family: inherit; max-height: 240px; overflow: auto; }
.bar { width: 300px; height: 12px; border: 1px solid #999; display: inline-block; vertical-align: middle; }
.fill { height: 100%; background: #4caf50; }
.st-failed, .st-unknown { color: #a40000; }
.st-sent { color: #2e7d32; }
</style>

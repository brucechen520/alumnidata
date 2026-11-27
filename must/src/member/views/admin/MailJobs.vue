<template>
  <div class="mail-jobs">
    <h3>寄件記錄</h3>
    <p v-if="error" class="warn">{{ error }}</p>
    <template v-if="data">
      <p :class="{ warn: data.worker.stale }">
        背景寄信服務最後執行時間：{{ data.worker.lastRunAt ? minute(data.worker.lastRunAt) : '尚未執行' }}
        <strong v-if="data.worker.stale">（超過 15 分鐘未執行，請確認 NAS 排程器狀態）</strong>
      </p>
      <p>
        滾動 24 小時額度：收件人 {{ data.budget.usedRecipients }}/{{ data.budget.dailyRecipients }}、信件 {{ data.budget.usedMessages }}/{{ data.budget.dailyMessages }}，
        目前可再寄 {{ data.budget.remaining }} 封；排隊中尚未寄出 {{ data.queuedTotal }} 位。
        <span v-if="data.budget.pausedUntil" class="warn">已因額度錯誤暫停，預計 {{ minute(data.budget.pausedUntil) }} 恢復。</span>
        <span v-else-if="data.budget.nextAvailableAt" class="warn">額度已滿，預計 {{ minute(data.budget.nextAvailableAt) }} 起陸續恢復。</span>
      </p>
      <p>
        <input type="button" value="建立新寄信" @click="$router.push('/admin/mail-jobs/new')">
        <input type="button" value="管理寄件範本" @click="$router.push('/admin/mail-templates')">
        <input type="button" value="重新整理" :disabled="busy" @click="load">
      </p>
      <table v-if="data.jobs.length" border="1" class="jobs">
        <tr><td>建立時間</td><td>建立者</td><td>主旨</td><td>進度</td><td>狀態</td><td>操作</td></tr>
        <tr v-for="j in data.jobs" :key="j.jobKey">
          <td>{{ minute(j.createdAt) }}</td>
          <td>{{ j.createdBy }}</td>
          <td>{{ j.subject }}</td>
          <td>
            {{ j.counts.sent }}/{{ j.total }}
            <span v-if="j.counts.failed" class="warn">失敗 {{ j.counts.failed }}</span>
            <span v-if="j.counts.unknown" class="warn">結果未明 {{ j.counts.unknown }}</span>
          </td>
          <td>{{ j.statusLabel }}<template v-if="j.resumeAt">（預計 {{ minute(j.resumeAt) }} 恢復）</template></td>
          <td><input type="button" value="詳細" @click="$router.push('/admin/mail-jobs/' + j.jobKey)"></td>
        </tr>
      </table>
      <p v-else>目前沒有寄信任務。</p>
    </template>
  </div>
</template>

<script>
import { adminApi } from '../../api';
import { formatTime, errorText } from '../../util';

export default {
  data() { return { data: null, error: '', busy: false }; },
  created() { this.load(); },
  methods: {
    minute(ts) { return formatTime(ts).slice(0, 16); },
    async load() {
      this.busy = true;
      try {
        this.data = (await adminApi.mailJobs()).data;
        this.error = '';
      } catch (error) {
        this.error = errorText(error, '無法讀取寄件記錄。');
      } finally { this.busy = false; }
    }
  }
};
</script>

<style scoped>
.warn { color: #a40000; }
.jobs td { padding: 2px 8px; }
</style>

<template>
  <div>
    <p v-if="error">{{ error }}</p>
    <template v-else-if="message">
      公布欄
      <table class="orange" style="text-align:left;"><tbody>
        <tr><th style="width:900px;">{{ message.topic }}</th></tr>
        <tr><td><pre style="white-space: pre-wrap">{{ message.content }}</pre></td></tr>
        <tr><td>{{ message.name }} 發表於 {{ format(message.time) }}</td></tr>
      </tbody></table><br>
      <router-link to="/">上一頁</router-link>
      <form v-if="shell.isAdmin" @submit.prevent="remove"><button type="submit" :disabled="busy">刪除</button></form>
    </template>
  </div>
</template>

<script>
import { memberApi } from '../api';
import { formatTime, errorText } from '../util';

export default {
  props: ['shell'],
  data() { return { message: null, error: '', busy: false }; },
  async created() {
    try { this.message = (await memberApi.message(this.$route.params.id)).data; }
    catch (error) { this.error = errorText(error, '無法讀取公佈欄。'); }
  },
  methods: {
    format: formatTime,
    async remove() {
      if (!confirm('此動作無法復原，確定嗎?')) return;
      this.busy = true;
      try { await memberApi.deleteMessage(this.message.id); this.$router.push('/'); }
      catch (error) { alert(errorText(error, '刪除失敗，請稍後再試。')); }
      finally { this.busy = false; }
    }
  }
};
</script>

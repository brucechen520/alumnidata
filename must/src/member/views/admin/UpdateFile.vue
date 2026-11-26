<template>
  <div>
    <h1>會務資料維護</h1>
    <form @submit.prevent="submit">
      <template v-for="f in files">
        {{ f.label }} <input :key="f.key" :ref="'file_' + f.key" type="file" accept="application/pdf,.pdf"><br :key="'br' + f.key">
      </template>
      <input type="submit" :disabled="busy">
    </form>
  </div>
</template>

<script>
import { adminApi } from '../../api';
import { errorText } from '../../util';

export default {
  data() { return { files: [], busy: false }; },
  async created() {
    try { this.files = (await adminApi.files()).data.files; }
    catch (error) { await this.$dialog.alert(errorText(error, '無法讀取檔案清單。')); }
  },
  methods: {
    async submit() {
      const messages = [];
      this.busy = true;
      for (const f of this.files) {
        const input = this.$refs['file_' + f.key];
        const file = input && input[0] && input[0].files[0];
        if (!file) continue; // 未選檔的欄位略過，與舊行為相同
        const data = new FormData();
        data.append('key', f.key);
        data.append('file', file);
        try { await adminApi.uploadFile(data); messages.push(f.label + '：OK'); }
        catch (error) { messages.push(f.label + '：' + errorText(error, '上傳失敗')); }
      }
      this.busy = false;
      await this.$dialog.alert(messages.length ? messages.join('\n') : '未選擇檔案');
      if (messages.length) this.$router.push('/');
    }
  }
};
</script>

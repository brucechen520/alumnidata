<template>
  <div>
    跑馬燈修改
    <form @submit.prevent="save">
      <input v-model="text" type="text" size="100" name="MData">
      <button :disabled="busy">送出</button>
    </form>
  </div>
</template>

<script>
import { adminApi } from '../../api';
import { errorText } from '../../util';

export default {
  props: { shell: { type: Object, required: true } },
  data() { return { text: '', busy: false }; },
  async created() {
    try { this.text = (await adminApi.marquee()).data.marquee; }
    catch (error) { await this.$dialog.alert(errorText(error, '無法讀取跑馬燈。')); }
  },
  methods: {
    async save() {
      this.busy = true;
      try {
        await adminApi.setMarquee(this.text);
        this.shell.marquee = this.text; // 外框立即顯示新內容
        await this.$dialog.alert('OK');
        this.$router.push('/');
      } catch (error) { await this.$dialog.alert(errorText(error, '設定失敗，請稍後再試。')); }
      finally { this.busy = false; }
    }
  }
};
</script>

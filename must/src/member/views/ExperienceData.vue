<template>
  <div v-if="form" class="member-form">
    <form name="form1" @submit.prevent="submit">
      <fieldset>
        <legend align="center">電機系系友資料表</legend>
        <table align="center" class="gmail">
          <tbody>
            <tr style="background-color:yellow"><td colspan="3">
              經驗分享
              <label><input v-model.number="form.shareOpen" type="radio" :value="1">公開</label>
              <label><input v-model.number="form.shareOpen" type="radio" :value="0">不公開</label>
            </td></tr>
            <tr><td colspan="3"><textarea v-model="form.experience" rows="10" cols="85"></textarea></td></tr>
            <tr><td></td><td><input value="送出" type="submit" :disabled="busy"></td><td></td></tr>
          </tbody>
        </table>
      </fieldset>
    </form>
  </div>
  <p v-else>{{ error }}</p>
</template>

<script>
import { memberApi } from '../api';
import { errorText } from '../util';

export default {
  data() { return { form: null, error: '', busy: false }; },
  async created() {
    try { this.form = (await memberApi.experience()).data; }
    catch (error) { this.error = errorText(error, '無法讀取資料。'); }
  },
  methods: {
    async submit() {
      this.busy = true;
      try {
        await memberApi.saveExperience({ shareOpen: this.form.shareOpen, experience: this.form.experience });
        alert('填寫成功');
        this.$router.push('/');
      } catch (error) { alert(errorText(error, '資料儲存失敗，請稍後再試。')); }
      finally { this.busy = false; }
    }
  }
};
</script>

<template>
  <form id="myform" name="myform" @submit.prevent="post">
    <table border="1">
      <tr>
        <td><p>主題</p></td>
        <td class="td"><input v-model="topic" name="topic" type="text" size="80" maxlength="100" required></td>
      </tr>
      <tr>
        <td><p>留言輸入內容</p></td>
        <td><textarea v-model="content" name="content" cols="60" rows="15" required></textarea></td>
      </tr>
      <tr>
        <td colspan="2"><br><input type="submit" name="Submit" value="送出" :disabled="busy">
          <input type="reset" name="reset" value="重新輸入" @click.prevent="topic = content = ''"></td>
      </tr>
    </table>
  </form>
</template>

<script>
import { adminApi } from '../../api';
import { errorText } from '../../util';

export default {
  data() { return { topic: '', content: '', busy: false }; },
  methods: {
    async post() {
      this.busy = true;
      try {
        await adminApi.postMessage(this.topic, this.content);
        this.$router.push('/'); // 發文後回首頁公佈欄，與舊處理檔轉址到 main.php 相同
      } catch (error) {
        await this.$dialog.alert(errorText(error, '發佈失敗，請稍後再試。'));
      } finally { this.busy = false; }
    }
  }
};
</script>

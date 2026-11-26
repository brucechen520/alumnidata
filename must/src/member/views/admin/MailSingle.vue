<template>
  <div>
    單一寄信件功能
    <form id="myform" name="myform" @submit.prevent="send">
      <center>
        <div class="sexyborder">
          <table border="1" class="table">
            <tr>
              <td><p>收件者姓名</p></td>
              <td class="td"><input v-model="recipient" name="recipient" type="text" size="20" maxlength="20"></td>
            </tr>
            <tr>
              <td><p>*收件者信箱</p></td>
              <td class="td"><input v-model="email" name="email" type="text" size="50" maxlength="50"></td>
            </tr>
            <tr>
              <td><p>*主旨</p></td>
              <td class="td"><input v-model="topic" name="topic" type="text" size="80" maxlength="100"></td>
            </tr>
            <tr>
              <td><p>*內文</p></td>
              <td><textarea v-model="content" name="content" cols="60" rows="15"></textarea></td>
            </tr>
            <tr>
              <td><p>夾帶檔案</p></td>
              <td><input ref="file" type="file" name="uploaded_file">選擇檔案後請等待上傳完成(出現檔名)</td>
            </tr>
            <tr>
              <td>※：*號表示必填!!</td>
              <td><br><input type="submit" name="Submit" value="送出" :disabled="busy">
                <input type="button" name="reset" value="重新輸入" @click="reset"></td>
            </tr>
          </table>
        </div>
      </center>
    </form>
  </div>
</template>

<script>
import { adminApi } from '../../api';
import { errorText } from '../../util';

export default {
  data() { return { recipient: '', email: '', topic: '', content: '', busy: false }; },
  methods: {
    reset() {
      this.recipient = this.email = this.topic = this.content = '';
      this.$refs.file.value = '';
    },
    async send() {
      // 檢查順序與訊息和舊頁面 check() 相同
      if (this.email === '') { await this.$dialog.alert('未輸入信箱'); return; }
      if (this.topic === '') { await this.$dialog.alert('未輸入主題'); return; }
      if (this.content === '') { await this.$dialog.alert('未輸入內容'); return; }
      const data = new FormData();
      data.append('recipient', this.recipient);
      data.append('email', this.email);
      data.append('topic', this.topic);
      data.append('content', this.content);
      const file = this.$refs.file.files[0];
      if (file) data.append('uploaded_file', file);
      this.busy = true;
      try {
        await adminApi.mailSingle(data);
        await this.$dialog.alert('Mail were Sent!');
        this.$router.push('/');
      } catch (error) {
        await this.$dialog.alert(errorText(error, '寄信失敗，請稍後再試。'));
      } finally { this.busy = false; }
    }
  }
};
</script>

<style scoped>
.sexyborder { border: 1px solid #0066cc; padding: 5px; border-radius: 5px; }
</style>

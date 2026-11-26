<template>
  <div class="out">
    <div class="out_title"><strong>留言板</strong></div>
    <center>
      <form name="myform" @submit.prevent="post">
        <div class="po">
          <div><div class="add_topic"><input v-model="topic" type="text" size="60" maxlength="30"></div></div>
          <div class="add_content"><div><textarea v-model="content" cols="88" rows="4"></textarea></div></div>
          <div>
            <input type="submit" value="po文" :disabled="busy">
            <input type="button" value="重新輸入" @click="reset">
          </div>
        </div>
      </form>
    </center>
    <br>
    <p v-if="error">{{ error }}</p>
    <template v-if="me">
      <div v-for="t in topics" :key="t.id">
        <div class="po">
          <div class="topic"><span><strong>{{ t.topic }}</strong></span></div>
          <div class="author_content">
            <div class="pic"><img :src="'/ee/images/Nopic.jpg'" width="50" height="50"></div>
            <div class="author_name"><strong>{{ t.authorName }}</strong></div>
            <div class="po_time">
              <p>{{ format(t.time) }}<button v-if="me.isAdmin" type="button" @click="removeTopic(t)">Delete</button></p>
            </div>
            <hr width="740px" size="2px">
            <div class="content"><p style="white-space: pre-wrap">{{ t.content }}</p></div>
          </div>
          <div v-for="r in t.replies" :key="r.id" class="reply">
            <div class="reply_author"><img :src="'/ee/images/Nopic.jpg'" width="50" height="50"><br><strong class="name">{{ r.authorName }}</strong></div>
            <div class="reply_content1">
              <div style="white-space: pre-wrap">{{ r.content }}</div>
              <div class="reply_time">{{ format(r.time) }}<button v-if="me.isAdmin" type="button" @click="removeReply(r)">Delete</button></div>
            </div>
          </div>
          <div class="reply">
            <div class="reply_author"><img :src="'/ee/images/Nopic.jpg'" width="50" height="50"></div>
            <form @submit.prevent="reply(t)">
              <div><textarea v-model="replies[t.id]" cols="70" maxlength="255"></textarea><input type="submit" value="回覆" :disabled="busy"></div>
            </form>
          </div>
        </div>
        <br>
      </div>
    </template>
  </div>
</template>

<script>
import { memberApi } from '../api';
import { formatTime, errorText } from '../util';

export default {
  data() { return { me: null, topics: [], topic: '標題', content: '你想說什麼?', replies: {}, busy: false, error: '' }; },
  created() { this.load(); },
  methods: {
    format: formatTime,
    async load() {
      try {
        const data = (await memberApi.mdcard()).data;
        this.me = data.me; this.topics = data.topics; this.error = '';
      } catch (error) { this.error = errorText(error, '無法讀取留言板。'); }
    },
    async run(payload, done) {
      this.busy = true;
      try { await memberApi.mdcardAction(payload); if (done) done(); await this.load(); }
      catch (error) { await this.$dialog.alert(errorText(error, '操作失敗，請稍後再試。')); }
      finally { this.busy = false; }
    },
    reset() { this.topic = '標題'; this.content = '你想說什麼?'; },
    async post() {
      // 訊息與舊頁面 check() 相同
      if (this.topic === '') { await this.$dialog.alert('未輸入主題'); return; }
      if (this.content === '') { await this.$dialog.alert('未輸入內容'); return; }
      this.run({ action: 'post', topic: this.topic, content: this.content }, this.reset);
    },
    async reply(t) {
      const content = this.replies[t.id] || '';
      if (content.trim() === '') { await this.$dialog.alert('未輸入內容'); return; }
      this.run({ action: 'reply', mdId: t.id, content }, () => { this.$set(this.replies, t.id, ''); });
    },
    removeTopic(t) { this.run({ action: 'deleteTopic', mdId: t.id }); },
    removeReply(r) { this.run({ action: 'deleteReply', mdrId: r.id }); }
  }
};
</script>

<style>
.out { padding: 50px 30px 30px 30px; background-color: #6F6D78; }
.out_title { width: 100px; margin-bottom: 20px; border-radius: 15px; padding: 10px; text-align: center; font-size: 30px; color: #FFFFFF; }
.add_topic { width: 750px; background-color: #266D96; margin-top: 10px; border-radius: 15px; padding: 10px; text-align: center; font-size: 15px; color: #FFFFFF; }
.add_content { width: 750px; background-color: #EBEBEB; margin: 10px; border-radius: 15px; padding: 10px; text-align: center; }
.po { width: 800px; background-color: #2D3E50; border-radius: 20px; padding: 10px; word-break: break-all; }
.topic { width: 750px; background-color: #266D96; margin-top: 10px; border-radius: 15px; padding: 10px; text-align: left; font-size: 20px; color: #FFFFFF; }
.author_content { width: 750px; background-color: #EBEBEB; margin: 10px; border-radius: 15px; padding: 10px; text-align: left; }
.reply { clear: left; }
.reply_author { width: 50px; float: left; margin: 10px; color: #EBEBEB; }
.reply_content1 { position: relative; float: left; width: 680px; margin: 10px; background-color: #FFFFFF; border-radius: 15px; padding: 10px 10px 30px 10px; text-align: left; word-break: break-all; }
.reply_time { position: absolute; bottom: 0px; right: 15px; }
.pic { float: left; width: 50px; height: 50px; margin: 10px; border-width: 1px; }
.author_name { height: 25px; margin: 10px 10px 0px 10px; color: #333333; font-size: 18px; }
.po_time { height: 25px; margin: 0px 10px 10px 10px; color: #333333; font-size: 12px; }
.content { margin: 10px; font-size: 15px; }
</style>

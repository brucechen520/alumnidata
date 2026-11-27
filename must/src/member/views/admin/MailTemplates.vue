<template>
  <div>
    <p><input type="button" value="返回寄件記錄" @click="$router.push('/admin/mail-jobs')"></p>
    <h3>寄件範本</h3>
    <p v-if="error" class="warn">{{ error }}</p>
    <p><input type="button" value="新增範本" @click="startNew"></p>
    <table border="1">
      <tr><th>範本名稱</th><th>主旨</th><th>附件</th><th>最後修改者</th><th>最後修改時間</th><th>操作</th></tr>
      <tr v-for="t in templates" :key="t.id">
        <td>{{ t.name }}</td><td>{{ t.subject }}</td><td>{{ t.attachmentName || '無' }}</td>
        <td>{{ t.updatedBy }}</td><td>{{ time(t.updatedAt) }}</td>
        <td><input type="button" value="編輯" @click="edit(t.id)"> <input type="button" value="刪除" @click="remove(t)"></td>
      </tr>
    </table>
    <p v-if="!templates.length">目前沒有寄件範本。</p>
    <form v-if="editing" @submit.prevent="save">
      <h4>{{ form.id ? '編輯範本' : '新增範本' }}</h4>
      <p>範本名稱（最多 50 字）：<input v-model="form.name" maxlength="50" size="50"></p>
      <p>主旨（最多 100 字）：<input v-model="form.subject" maxlength="100" size="80"></p>
      <p>內文：<br><textarea v-model="form.body" cols="80" rows="12"></textarea></p>
      <p>主旨與內文可用個人化欄位：<code>{姓名}</code>、<code>{畢業級別}</code>、<code>{信箱}</code>。</p>
      <p v-if="unsupported.length" class="warn">不支援的欄位：{{ unsupported.join('、') }}</p>
      <p v-if="form.attachmentName">現有附件：{{ form.attachmentName }} <label><input v-model="form.removeAttachment" type="checkbox">移除</label></p>
      <p>選擇新附件（上限 5 MB）：<input :key="fileKey" type="file" @change="file = $event.target.files[0] || null"></p>
      <p><input type="submit" value="儲存" :disabled="busy"> <input type="button" value="取消" @click="editing = false"></p>
    </form>
  </div>
</template>

<script>
import { adminApi } from '../../api';
import { errorText, formatTime } from '../../util';
const FIELDS = ['{姓名}', '{畢業級別}', '{信箱}'];
export default {
  data() { return { templates: [], editing: false, form: {}, file: null, fileKey: 0, busy: false, error: '' }; },
  computed: {
    unsupported() {
      const found = ((this.form.subject || '') + '\n' + (this.form.body || '')).match(/\{[^{}]*\}/g) || [];
      return found.filter((p, i) => FIELDS.indexOf(p) === -1 && found.indexOf(p) === i);
    }
  },
  created() { this.load(); },
  methods: {
    time(ts) { return formatTime(ts).slice(0, 16); },
    async load() {
      try { this.templates = (await adminApi.mailTemplates()).data.templates; this.error = ''; }
      catch (e) { this.error = errorText(e, '無法讀取範本。'); }
    },
    startNew() { this.form = { id: null, name: '', subject: '', body: '', attachmentName: '', removeAttachment: false }; this.file = null; this.fileKey++; this.editing = true; },
    async edit(id) {
      try {
        const t = (await adminApi.mailTemplate(id)).data;
        this.form = Object.assign({}, t, { removeAttachment: false }); this.file = null; this.fileKey++; this.editing = true; this.error = '';
      } catch (e) { this.error = errorText(e, '無法讀取範本。'); }
    },
    async save() {
      if (!this.form.name.trim() || !this.form.subject.trim() || !this.form.body.trim()) { await this.$dialog.alert('請填寫範本名稱、主旨與內文。'); return; }
      if (this.unsupported.length) { await this.$dialog.alert('不支援的欄位：' + this.unsupported.join('、')); return; }
      if (this.file && this.file.size > 5 * 1024 * 1024) { await this.$dialog.alert('附件過大（上限 5 MB）。'); return; }
      if (this.file && this.form.removeAttachment) { await this.$dialog.alert('不能同時更換與移除附件。'); return; }
      const data = new FormData();
      data.append('action', this.form.id ? 'update' : 'create');
      if (this.form.id) data.append('id', this.form.id);
      data.append('name', this.form.name); data.append('subject', this.form.subject); data.append('body', this.form.body);
      if (this.file) data.append('uploaded_file', this.file);
      if (this.form.removeAttachment) data.append('removeAttachment', '1');
      this.busy = true;
      try { await adminApi.mailTemplateSave(data); this.editing = false; await this.load(); }
      catch (e) { this.error = errorText(e, '範本儲存失敗。'); }
      finally { this.busy = false; }
    },
    async remove(t) {
      if (!(await this.$dialog.confirm('確定刪除範本「' + t.name + '」？刪除範本不影響已建立的寄信任務。'))) return;
      try { await adminApi.mailTemplateDelete(t.id); if (this.form.id === t.id) this.editing = false; await this.load(); }
      catch (e) { this.error = errorText(e, '刪除範本失敗。'); }
    }
  }
};
</script>

<style scoped>.warn { color: #a40000; }</style>

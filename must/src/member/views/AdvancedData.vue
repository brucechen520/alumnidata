<template>
  <div v-if="form" class="member-form">
    <form name="form1" @submit.prevent="submit">
      <fieldset>
        <legend align="center">電機系系友資料表</legend>
        <table align="center" class="gmail">
          <tbody>
            <tr style="background-color:yellow"><td colspan="3">帳號
              <label><input v-model.number="form.emailOpen" type="radio" :value="1">公開</label>
              <label><input v-model.number="form.emailOpen" type="radio" :value="0">不公開(可以的話，請勾選公開，讓系友能連絡您!!)</label>
            </td></tr>
            <tr><td>電子信箱:</td><td>{{ form.email }}</td><td></td></tr>
            <tr style="background-color:yellow"><td colspan="3">工作資料:
              <label><input v-model.number="form.workOpen" type="radio" :value="1">公開</label>
              <label><input v-model.number="form.workOpen" type="radio" :value="0">不公開</label></td></tr>
            <tr>
              <td>目前服務單位</td>
              <td><input v-model="form.unit" type="text" class="BigInput"></td>
              <td><font color="#999999" size="-1">請填入公司名稱 或 學校名稱 或 主管機關名稱</font><br><font color="red" size="-1">已退休的系友請填退休!</font></td>
            </tr>
            <tr><td>部門 或 學系</td><td><input v-model="form.department" type="text" class="BigInput"></td><td><font color="#999999" size="-1">請填入部門或學系名稱</font><br></td></tr>
            <tr><td>職稱</td><td><input v-model="form.title" type="text" class="BigInput"></td><td><font color="#999999" size="-1">請填入在該單位所對應職稱</font><br></td></tr>
            <tr><td>公司電話與分機</td><td><input v-model="form.companyTel" type="text" class="BigInput"></td><td><font color="#999999" size="-1">請填入該單位電話與分機 範例 02-2861-0511#25105</font><br></td></tr>
            <tr style="background-color:yellow"><td colspan="3">曾經服務單位:
              <label><input v-model.number="form.workOpen2" type="radio" :value="1">公開</label>
              <label><input v-model.number="form.workOpen2" type="radio" :value="0">不公開</label></td></tr>
            <tr>
              <td>曾經服務單位</td>
              <td>
                <img :src="'/ee/image/PlusSign.png'" height="20" width="20" style="cursor: pointer" @click="form.works.push('')"><font color="#999999" size="-2">增加欄位</font><br>
                <template v-for="(w, i) in form.works"><input :key="i" class="BigInput" :value="w" @input="$set(form.works, i, $event.target.value)"><br :key="'b' + i"></template>
              </td>
              <td><font color="#999999" size="-1">請填入曾經服務單位，做為系統搜尋使用!</font><br></td>
            </tr>
            <tr style="background-color:yellow"><td colspan="3">其他資料:</td></tr>
            <tr>
              <td>BLOG或網站</td>
              <td>
                <img :src="'/ee/image/PlusSign.png'" height="20" width="20" style="cursor: pointer" @click="form.websites.push('')"><font color="#999999" size="-2">增加欄位</font><br>
                <template v-for="(w, i) in form.websites"><input :key="i" class="BigInput" :value="w" @input="$set(form.websites, i, $event.target.value)"><br :key="'b' + i"></template>
              </td>
              <td><font color="#999999" size="-1">能在網路上敘述您各人相關事業經歷的地方</font><br></td>
            </tr>
            <tr><td>通訊地址(大略)</td><td><input v-model="form.address" type="text" class="BigInput"></td><td><font color="#999999" size="-1">請填入長期居住地址 Ex:新北市中和區<br></font></td></tr>
            <tr class="important"><td>通訊地址2(詳細)</td><td><input v-model="form.address2" type="text" class="BigInput"></td><td><font color="#999999" size="-1">請填入長期居住地址 Ex:路巷號(資料將保密)<br></font></td></tr>
            <tr class="important"><td>連絡電話(手機):</td><td><input v-model="form.phone" type="text" class="BigInput"></td><td><font color="#999999" size="-1">(資料將保密)</font></td></tr>
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
    try { this.form = (await memberApi.advanced()).data; }
    catch (error) { this.error = errorText(error, '無法讀取資料。'); }
  },
  methods: {
    async submit() {
      const f = this.form;
      const payload = {
        emailOpen: f.emailOpen, workOpen: f.workOpen, workOpen2: f.workOpen2,
        unit: f.unit, department: f.department, title: f.title, companyTel: f.companyTel,
        address: f.address, address2: f.address2, phone: f.phone,
        websites: f.websites.filter(Boolean), works: f.works.filter(Boolean)
      };
      this.busy = true;
      try {
        await memberApi.saveAdvanced(payload);
        alert('填寫成功');
        this.$router.push('/');
      } catch (error) { alert(errorText(error, '資料儲存失敗，請稍後再試。')); }
      finally { this.busy = false; }
    }
  }
};
</script>

<style>
.member-form tr.important { background: #FFCCCC; }
</style>

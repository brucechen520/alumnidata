<template>
  <div v-if="form" class="member-form">
    <form name="form1" @submit.prevent="submit">
      <fieldset style="width:90%">
        <legend align="center">電機系系友資料表</legend>
        <table align="center" class="gmail">
          <tbody>
            <tr style="background-color:yellow"><td colspan="3">帳號</td></tr>
            <tr><td>電子信箱:</td><td>{{ form.email }}</td><td></td></tr>
            <tr style="background-color:yellow"><td colspan="3">基本資料</td></tr>
            <tr><td>姓名:</td><td>{{ form.name }}</td><td></td></tr>
            <tr>
              <td>性別:</td>
              <td>
                <template v-for="s in ['男', '女', '第三性別']"><label :key="s"><input v-model="form.sex" name="sex" :value="s" type="radio">{{ s }}</label>{{ ' ' }}</template>
              </td>
            </tr>
            <tr>
              <td>生日</td>
              <td><input v-model="form.birth" type="text"><input type="button" value="日曆顯示" @click="openPicker"><input ref="picker" class="date-picker" type="date" aria-label="日曆選擇" @change="pick"></td>
              <td><font color="#999999" size="-1">格式範例 1985/02/05</font></td>
            </tr>
            <tr style="background-color:yellow"><td colspan="3">就讀於逢甲電機的學籍有:</td></tr>
            <tr v-for="row in schools" :key="row.is">
              <td><label><input v-model="form[row.is]" type="checkbox">{{ row.label }}</label></td>
              <td>畢業級別:<select v-model.number="form[row.level]"><option :value="0">請選擇</option><option v-for="y in years" :key="y" :value="y">{{ y }}</option></select>級
                <template v-if="row.is === 'isU'">班別:<select v-model.number="form.uClass"><option v-for="(c, i) in ['甲班', '乙班', '丙班', '丁班']" :key="i" :value="i + 1">{{ c }}</option></select></template>
              </td>
              <td v-if="row.is === 'isU'" rowspan="4"><font color="#999999" size="-1">畢業級別 = 畢業的民國年</font></td>
            </tr>
            <tr>
              <td>專業領域:</td>
              <td><list-input v-model="form.specialty"></list-input><img :src="'/ee/image/PlusSign.png'" height="20" width="20" style="cursor: pointer" @click="form.specialty.push('')"><font color="#999999" size="-2">增加欄位</font></td>
              <td rowspan="3"><font color="#999999" size="-1"><font color="#ff0000">*專業領域、興趣和活動地區請至少填寫一項喔</font><br>如想填寫多項可點選"<img :src="'/ee/image/PlusSign.png'" height="20" width="20">"圖示來增加欄位~!</font></td>
            </tr>
            <tr>
              <td>興趣:</td>
              <td><list-input v-model="form.interest"></list-input><img :src="'/ee/image/PlusSign.png'" height="20" width="20" style="cursor: pointer" @click="form.interest.push('')"><font color="#999999" size="-2">增加欄位</font></td>
            </tr>
            <tr>
              <td>活動地區:</td>
              <td><list-input v-model="form.location"></list-input><img :src="'/ee/image/PlusSign.png'" height="20" width="20" style="cursor: pointer" @click="form.location.push('')"><font color="#999999" size="-2">增加欄位</font></td>
            </tr>
            <tr>
              <td>就學學校及科系及學程組別:</td>
              <td><input v-model="form.eGroup" type="text" class="BigInput"></td>
              <td><font color="#999999">請填寫在本校的</font></td>
            </tr>
            <tr>
              <td>在校曾擔任的幹部:</td>
              <td>
                <template v-for="c in cadreChoices"><label :key="c"><input v-model="cadre" type="checkbox" :value="c">{{ c }}</label>{{ ' ' }}</template>
                <br>其他 <input v-model="cadreOther" type="text" class="BigInput">
              </td>
              <td><font color="#999999">系學會幹部、班上幹部</font></td>
            </tr>
            <tr>
              <td>在校參加的社團:</td>
              <td>
                <template v-for="c in societyChoices"><label :key="c"><input v-model="society" type="checkbox" :value="c">{{ c }}</label>{{ ' ' }}</template>
                <br>其他<input v-model="societyOther" type="text" class="BigInput">
              </td>
              <td><font color="#999999">學校社團或系隊</font></td>
            </tr>
            <tr>
              <td>其他學校學歷(碩士、博士班):</td>
              <td><textarea v-model="form.oSchool" class="BigInput"></textarea></td>
              <td><font color="#999999">請詳細填寫在其他學校就學經歷</font></td>
            </tr>
            <tr>
              <td>協助辨別身分欄位:</td>
              <td><textarea v-model="form.help" rows="3" class="BigInput"></textarea></td>
              <td><font color="#999999">請填寫 推薦人或貴班 班代或 系上班導 或同學等, 以方便管理員快速確認您是系友</font></td>
            </tr>
            <tr><td></td><td><input value="送出" type="submit" :disabled="busy"></td><td></td></tr>
          </tbody>
        </table>
      </fieldset>
    </form>
  </div>
  <p v-else>{{ error }}</p>
</template>

<script>
import ListInput from '../components/ListInput.vue';
import { memberApi } from '../api';
import { errorText } from '../util';

const CADRE = ['班代', '系學會會長', '系學會副會長'];
const SOCIETY = ['系拔', '系籃', '系排', '系壘', '系羽', '系桌'];

export default {
  components: { ListInput },
  data() {
    return {
      form: null, error: '', busy: false,
      cadre: [], cadreOther: '', society: [], societyOther: '',
      cadreChoices: CADRE, societyChoices: SOCIETY,
      schools: [
        { is: 'isU', level: 'uLevel', label: '大學' }, { is: 'isM', level: 'mLevel', label: '研究所' },
        { is: 'isD', level: 'dLevel', label: '博班' }, { is: 'isS', level: 'sLevel', label: '在職專班' }
      ]
    };
  },
  computed: {
    years() {
      const list = [];
      for (let y = this.form.maxLevel; y >= 67; y--) list.push(y);
      return list;
    }
  },
  async created() {
    try {
      const form = (await memberApi.basic()).data;
      // 與舊頁面一致：固定選項以勾選呈現，其餘項目以逗號串成「其他」一格
      // 固定選項是否勾選由伺服器依項目編號判斷（與舊頁面 CheckCadre／CheckSociety 相同）
      this.cadre = CADRE.filter((n, i) => form.cadreChecked[i]);
      this.cadreOther = form.cadreOther;
      this.society = SOCIETY.filter((n, i) => form.societyChecked[i]);
      this.societyOther = form.societyOther;
      form.uClass = form.uClass || 1;
      ['specialty', 'interest', 'location'].forEach(k => { if (!form[k].length) form[k] = ['']; });
      this.form = form;
    } catch (error) { this.error = errorText(error, '無法讀取資料。'); }
  },
  methods: {
    openPicker() {
      const picker = this.$refs.picker;
      try { if (picker.showPicker) { picker.showPicker(); return; } } catch (e) { /* 改用原生日期欄位 */ }
      picker.focus(); picker.click();
    },
    pick(event) {
      if (event.target.value) this.form.birth = event.target.value.replace(/-/g, '/');
    },
    validate() {
      const f = this.form;
      // 訊息與舊頁面 register() 相同
      if (!(f.isU || f.isM || f.isD || f.isS)) return '未勾選學籍資料!';
      for (const row of this.schools) if (f[row.is] && Number(f[row.level]) === 0) return '請選擇級別';
      const blank = list => !list.some(v => v.replace(/^\s*|\s*$/g, '') !== '');
      if (blank(f.specialty)) return '專業領域未填寫!';
      if (blank(f.interest)) return '興趣未填寫!';
      if (blank(f.location)) return '活動地區未填寫!';
      return '';
    },
    async submit() {
      const problem = this.validate();
      if (problem) { alert(problem); return; }
      const f = this.form;
      const payload = {
        sex: f.sex, birth: f.birth, isU: f.isU, isM: f.isM, isD: f.isD, isS: f.isS, uClass: f.uClass,
        uLevel: f.uLevel, mLevel: f.mLevel, dLevel: f.dLevel, sLevel: f.sLevel,
        eGroup: f.eGroup, oSchool: f.oSchool, help: f.help,
        specialty: f.specialty.filter(Boolean), interest: f.interest.filter(Boolean), location: f.location.filter(Boolean),
        cadre: [...this.cadre, this.cadreOther].filter(Boolean),
        society: [...this.society, this.societyOther].filter(Boolean)
      };
      this.busy = true;
      try {
        await memberApi.saveBasic(payload);
        alert('填寫成功');
        this.$router.push('/');
      } catch (error) { alert(errorText(error, '資料儲存失敗，請稍後再試。')); }
      finally { this.busy = false; }
    }
  }
};
</script>

<style>
.member-form td:nth-child(1) { width: 100px; }
.member-form .BigInput { width: 300px; }
.member-form .date-picker { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
.member-form td { text-align: left; }
</style>

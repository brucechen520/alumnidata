<template>
  <div>
    <table v-if="page === 'login'" width="780" border="0" align="center" cellpadding="4" cellspacing="0">
      <tr><td class="tdbline"><img :src="'/ee/image/M_main1.jpg'" alt="會員系統" width="773" height="400" align="middle"></td></tr>
      <tr><td class="tdbline"><table width="100%" border="0" cellspacing="0" cellpadding="10"><tr valign="top">
        <td class="tdrline"><p class="title">逢甲大學電機系系友會會員系統</p>
          <p>感謝各位來到會員系統， 所有的會員功能都必須經由登入後才能使用，請您在右方視窗中執行登入動作。</p>
          <p class="heading"> 會員申請需注意事項：</p>
          <ol>
            <li>需為逢甲大學電機系系友方可加入會員 。</li>
            <li>凡本校電機系, 碩博班, 在職專班之系友皆可申請加入。</li>
            <li>本系統採 email帳號 認證, 經管理者核可確 <br>認身份後, 將發出可登入電子信函通知。</li>
            <li>若是遺忘密碼，會員可由系統重新發出電子信函通知。</li>
          </ol>
          <p class="heading">請各位會員遵守以下規則： </p>
          <ol>
            <li> 遵守政府的各項有關法律法規。</li>
            <li> 不得在發佈任何色情非法， 以及危害國家安全的言論。</li>
            <li>嚴禁連結有關政治， 色情， 宗教， 迷信等違法訊息。</li>
            <li> 承擔一切因您的行為而直接或間接導致的民事或刑事法律責任。</li>
            <li> 互相尊重， 遵守互聯網絡道德；嚴禁互相惡意攻擊， 漫罵。</li>
            <li> 管理員擁有一切管理權力。</li>
          </ol></td>
        <td width="200" bgcolor="#CCCCFF"><div class="boxtl"></div><div class="boxtr"></div><div class="regbox">
          <div v-if="error" class="errDiv">{{ error }}</div>
          <p class="heading">登入會員系統</p>
          <p class="heading"><a :href="'/eebs/'">訪客進入</a></p>
          <hr size="1">
          <form name="form1" @submit.prevent="login">使用系友帳號登入
            <p>帳號：(email)<br><input id="username" v-model="username" name="username" type="text" class="logintextbox"></p>
            <p>密碼：<br><input id="passwd" v-model="password" name="passwd" type="password" class="logintextbox"></p>
            <p align="center"><input id="button" type="submit" name="button" value="登入系統" :disabled="busy"></p>
          </form>
          <p align="center"><a href="#forgot">忘記密碼，補寄密碼信。</a></p>
          <p style="float: left;"><a :href="'/ee/File/Privacy.pdf'" target="_blank">隱私權聲明</a></p>
          <p align="right"><a href="#register">申請會員</a></p>
        </div><div class="boxbl"></div><div class="boxbr"></div></td>
      </tr></table></td></tr>
      <tr><td align="center" :background="'/ee/images/album_r2_c1.jpg'" class="trademark">© 2014 FCUEE WEB Studio All Rights Reserved.</td></tr>
    </table>

    <main v-else class="entry-form">
      <p><a href="#login">回登入頁</a></p>
      <template v-if="page === 'forgot'">
        <h1>忘記密碼</h1>
        <form @submit.prevent="requestReset">
          <label>你的帳號(電子信箱): <input v-model.trim="email" type="email" required></label>
          <p><button type="submit" :disabled="busy">送出</button></p>
        </form>
        <p role="status">{{ notice || error }}</p>
      </template>
      <template v-else-if="page === 'reset'">
        <h1>重新設定密碼</h1>
        <form @submit.prevent="reset">
          <p><label>新密碼 <input v-model="password" type="password" required></label></p>
          <p><label>新密碼確認 <input v-model="passwordConfirm" type="password" required></label></p>
          <button type="submit" :disabled="busy">送出</button>
        </form>
        <p role="status">{{ notice || error }}</p>
      </template>
      <template v-else-if="page === 'register'">
        <h1>電機系系友資料表</h1>
        <form @submit.prevent="register">
          <fieldset><legend>帳號</legend>
            <p><label>電子信箱: <input ref="email" v-model.trim="registration.Email" type="email" @input="emailStatus = ''" @blur="checkEmail"></label> *必填 <span role="status">{{ emailStatus }}</span></p>
            <p><label>密碼: <input ref="pwd" v-model="registration.pwd" type="password"></label> *必填<br>(此新自訂密碼為登入本網站使用,非指原來您的郵件密碼)</p>
            <p><label>密碼確認: <input ref="pwd2" v-model="registration.pwd2" type="password"></label> *必填</p>
          </fieldset>
          <fieldset><legend>基本資料</legend>
            <p><label>姓名: <input ref="name" v-model.trim="registration.name"></label> *必填</p>
            <p>性別: <label v-for="sex in ['男','女','第三性別']" :key="sex"><input v-model="registration.sex" type="radio" :value="sex">{{ sex }}</label></p>
            <p><label>生日: <input ref="birth" v-model="registration.birth" placeholder="1985/02/05"></label> <button type="button" @click="openBirthPicker">日曆選擇</button><input ref="birthPicker" class="birth-picker" type="date" aria-label="日曆選擇" @change="setBirthFromPicker"> 格式範例 1985/02/05</p>
          </fieldset>
          <fieldset><legend>就讀於逢甲電機的學籍有:</legend>
            <p v-for="item in schoolFields" :key="item.flag">
              <label><input ref="schoolInput" v-model="registration[item.flag]" type="checkbox">{{ item.label }}</label>
              畢業級別: <select :ref="item.level" v-model="registration[item.level]"><option value="0">請選擇</option><option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option></select>級
              <label v-if="item.flag === 'IsU'">班別: <select v-model="registration.UClass"><option value="1">甲班</option><option value="2">乙班</option><option value="3">丙班</option><option value="4">丁班</option></select></label>
            </p>
            <p>畢業級別 = 畢業的民國年</p>
          </fieldset>
          <fieldset><legend>其他資料</legend>
            <p v-for="item in listFields" :key="item.key">{{ item.label }}:
              <span v-for="(value, index) in registration[item.key]" :key="index"><input :ref="item.key" v-model.trim="registration[item.key][index]"><button v-if="index" type="button" @click="registration[item.key].splice(index, 1)">刪除</button></span>
              <button type="button" @click="registration[item.key].push('')">增加欄位</button>
            </p>
            <p><label>在校學程及組別: <input v-model.trim="registration.EGroup"></label></p>
            <p>在校曾擔任的幹部: <label v-for="item in cadreChoices" :key="item"><input v-model="registration.Cadre" type="checkbox" :value="item">{{ item }}</label><input v-model.trim="cadreOther" placeholder="其他"></p>
            <p>在校曾參加的社團: <label v-for="item in societyChoices" :key="item.value"><input v-model="registration.Socie" type="checkbox" :value="item.value">{{ item.label }}</label><input v-model.trim="societyOther" placeholder="其他"></p>
            <p><label>其他學校學歷(碩士、博士班): <input v-model.trim="registration.OSchool"></label></p>
            <p><label>協助辨別身分欄位: <textarea v-model.trim="registration.Help"></textarea></label></p>
          </fieldset>
          <p><button type="submit" :disabled="busy">送出</button></p>
        </form>
        <p role="status">{{ notice || error }}</p>
      </template>
    </main>
  </div>
</template>

<script>
import { entryApi } from './api';
import { ready, errorMessage } from '../shared/http';

export default {
  data() {
    return {
      page: 'login', username: '', password: '', passwordConfirm: '', email: '', busy: false, error: '', notice: '',
      cadreOther: '', societyOther: '', emailStatus: '',
      cadreChoices: ['班代', '系學會會長', '系學會副會長'],
      societyChoices: [
        { label: '系拔', value: '系拔' }, { label: '系籃', value: '系藍' },
        { label: '系排', value: '系排' }, { label: '系壘', value: '系壘' },
        { label: '系羽', value: '系羽' }, { label: '系桌', value: '系桌' }
      ],
      schoolFields: [
        { flag: 'IsU', level: 'ULevel', label: '大學' }, { flag: 'IsM', level: 'MLevel', label: '研究所' },
        { flag: 'IsD', level: 'DLevel', label: '博班' }, { flag: 'IsS', level: 'SLevel', label: '在職專班' }
      ],
      listFields: [
        { key: 'specialty', label: '專業領域' }, { key: 'interest', label: '興趣' }, { key: 'location', label: '活動地區' }
      ],
      registration: {
        Email: '', pwd: '', pwd2: '', name: '', sex: '男', birth: '',
        IsU: false, IsM: false, IsD: false, IsS: false,
        ULevel: '0', MLevel: '0', DLevel: '0', SLevel: '0', UClass: '1',
        specialty: [''], interest: [''], location: [''], EGroup: '', Cadre: [], Socie: [], OSchool: '', Help: ''
      }
    };
  },
  computed: {
    years() {
      const end = new Date().getFullYear() - 1911 + 4;
      return Array.from({ length: end - 66 }, (_, index) => end - index);
    }
  },
  created() {
    this.changePage();
    window.addEventListener('hashchange', this.changePage);
    ready().catch(() => {});
  },
  beforeDestroy() { window.removeEventListener('hashchange', this.changePage); },
  methods: {
    changePage() {
      const route = location.hash.slice(1);
      this.page = ['register', 'forgot', 'reset'].includes(route) ? route : 'login';
      this.error = ''; this.notice = '';
    },
    async submit(call, success, onError) {
      this.error = ''; this.notice = ''; this.busy = true;
      try { await ready(); await call(); success(); }
      catch (error) {
        this.error = error.response && error.response.data && error.response.data.code === 'invalid_credentials'
          ? '登入帳號或密碼錯誤！' : errorMessage(error, '操作失敗，請稍後再試。');
        if (onError) onError(this.error, error);
      }
      finally { this.busy = false; }
    },
    login() {
      if (!this.username || !this.password) { this.error = '請輸入帳號與密碼。'; return; }
      this.submit(() => entryApi.login(this.username, this.password), () => { location.href = '/ee/main.php'; });
    },
    requestReset() {
      this.submit(() => entryApi.requestReset(this.email), () => { this.notice = '已將認證信寄置您的信箱! 若沒收到請檢查垃圾信件箱，並使用信件中連結重新登入!'; });
    },
    reset() {
      if (!this.password || this.password !== this.passwordConfirm) { this.error = '密碼比對錯誤!'; return; }
      this.submit(() => entryApi.reset(this.password, this.passwordConfirm), () => { alert('修改完成'); location.href = '/ee/main.php'; });
    },
    focusField(ref) {
      const field = this.$refs[ref];
      const target = Array.isArray(field) ? field[0] : field;
      if (target) target.focus();
    },
    alertAt(message, ref) {
      alert(message);
      if (ref) this.focusField(ref);
      return false;
    },
    openBirthPicker() {
      const picker = this.$refs.birthPicker;
      try {
        if (picker.showPicker) { picker.showPicker(); return; }
      } catch (error) { /* Fall back to the native date input. */ }
      picker.focus(); picker.click();
    },
    setBirthFromPicker(event) {
      if (event.target.value) this.registration.birth = event.target.value.replace(/-/g, '/');
    },
    async checkEmail() {
      const email = this.registration.Email.trim();
      if (!email || !this.$refs.email.validity.valid) return;
      try {
        const response = await entryApi.emailExists(email);
        if (this.registration.Email.trim() === email) {
          this.emailStatus = response.data.IsExist
            ? '此Email已註冊過!請使用其他Email,或忘記密碼功能' : 'Email可用';
        }
      } catch (error) { this.emailStatus = ''; }
    },
    birthValid(value) {
      const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(value.trim());
      if (!match) return false;
      const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3]);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    },
    register() {
      const data = this.registration;
      if (!data.Email.trim()) return this.alertAt('Email未填寫!', 'email');
      if (!data.pwd.trim()) { data.pwd = ''; return this.alertAt('密碼未填寫!', 'pwd'); }
      if (data.pwd !== data.pwd2) { data.pwd = ''; data.pwd2 = ''; return this.alertAt('密碼比對錯誤!', 'pwd'); }
      if (!data.name.trim()) { data.name = ''; return this.alertAt('等等!你忘了填名字了!!', 'name'); }
      if (!this.birthValid(data.birth)) return this.alertAt('生日格式錯誤', 'birth');
      if (!this.schoolFields.some(item => data[item.flag])) return this.alertAt('未勾選學籍資料!', 'schoolInput');
      const missingLevel = this.schoolFields.find(item => data[item.flag] && data[item.level] === '0');
      if (missingLevel) return this.alertAt('請選擇級別', missingLevel.level);
      const missingList = this.listFields.find(item => !data[item.key][0].trim());
      if (missingList) return this.alertAt(missingList.label + '未填寫!', missingList.key);
      const payload = { ...data, Cadre: data.Cadre.concat(this.cadreOther ? [this.cadreOther] : []), Socie: data.Socie.concat(this.societyOther ? [this.societyOther] : []) };
      this.submit(() => entryApi.register(payload), () => { alert('填寫成功!'); location.href = '/ee/'; }, (message, error) => {
        alert(message);
        if (error.response && error.response.data && error.response.data.code === 'email_exists') this.focusField('email');
        if (error.response && error.response.data && error.response.data.code === 'bad_birth_date') this.focusField('birth');
      });
    }
  }
};
</script>

<style scoped>
.entry-form { max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: Arial, sans-serif; }
.entry-form fieldset { margin: 1rem 0; border: 1px solid #aaa; }
.entry-form label { margin-right: .5rem; }
.entry-form input, .entry-form textarea { max-width: 100%; }
.entry-form [type=checkbox], .entry-form [type=radio] { margin-right: .25rem; }
.birth-picker { position: absolute; width: 1px; height: 1px; opacity: 0; }
</style>

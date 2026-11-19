<template>
  <p v-if="error">{{ error }}</p>
  <div v-else-if="p" id="P_All">
    <div id="head" :class="{ female: p.isFemale }">
      <div id="PImg"><img :src="'/ee/images/Nopic.jpg'"></div>
      <div id="Pname">{{ p.name }}<br><div></div></div>
      <div id="PLearn">
        <template v-if="p.learn.u">{{ p.learn.u.level }}級 學士 {{ classNames[p.learn.u.uClass] || '' }}<br></template>
        <template v-if="p.learn.m">{{ p.learn.m.level }}級 碩士<br></template>
        <template v-if="p.learn.d">{{ p.learn.d.level }}級 博士<br></template>
        <template v-if="p.learn.s">{{ p.learn.s.level }}級 在職專班<br></template>
      </div>
    </div>
    <div class="P_File">
      <div class="P_File_Title">關於</div>
      <template v-for="row in aboutRows">
        <div :key="'t' + row.label" class="P_S_Title">{{ row.label }}</div>
        <div :key="'d' + row.label" class="P_S_Data">{{ row.value }}</div>
        <hr :key="'h' + row.label" class="Myhr">
      </template>
      <div class="P_S_Title">信箱</div>
      <div class="P_S_Data">
        <template v-if="p.about.email !== null">{{ p.about.email }}<i v-if="p.about.emailPrivate">(會員不公開)</i></template>
        <i v-else>不公開</i>
      </div>
      <hr class="Myhr">
      <div class="P_S_Title">網站</div><div class="P_S_Data">{{ p.about.website }}</div><hr class="Myhr">
      <div class="P_S_Title">居住地</div><div class="P_S_Data">{{ p.about.address }}</div><hr class="Myhr">
      <template v-if="p.admin">
        <div class="P_S_Title">詳細居住地<i>(隱藏)</i></div><div class="P_S_Data">{{ p.admin.address2 }}</div><hr class="Myhr">
        <div class="P_S_Title">手機<i>(隱藏)</i></div><div class="P_S_Data">{{ p.admin.phone }}</div><hr class="Myhr">
        <div class="P_S_Title">身分辨認欄位<i>(隱藏)</i></div><div class="P_S_Data">{{ p.admin.help }}</div><hr class="Myhr">
      </template>
    </div>
    <div class="P_File">
      <div class="P_File_Title">職業<i v-if="p.work.notOpen">(用戶不公開)</i></div>
      <div v-if="p.work.state === 'locked'" class="P_Share" style="height:20px"><i>需先分享才能觀看</i></div>
      <div v-else-if="p.work.state === 'private'" class="P_Share" style="height:20px"><i>不公開</i></div>
      <template v-else>
        <div class="P_S_Title">服務單位</div><div class="P_S_Data">{{ p.work.unit }}</div><hr class="Myhr">
        <div class="P_S_Title">部門</div><div class="P_S_Data">{{ p.work.department }}</div><hr class="Myhr">
        <div class="P_S_Title">職稱</div><div class="P_S_Data">{{ p.work.title }}</div><hr class="Myhr">
        <div class="P_S_Title">公司電話</div><div class="P_S_Data">{{ p.work.companyTel }}</div><hr class="Myhr">
        <div class="P_S_Title">曾經服務單位</div>
        <div class="P_S_Data">{{ p.work.works ? p.work.works.join('、') : '' }}<template v-if="p.work.worksPrivate">(未公開)</template></div>
        <hr class="Myhr">
      </template>
    </div>
    <div class="P_File">
      <div class="P_File_Title">分享<i v-if="p.share.notOpen">(用戶不公開)</i></div>
      <div v-if="p.share.state === 'locked'" class="P_Share" style="height:20px"><i>需先分享才能觀看</i></div>
      <div v-else-if="p.share.state === 'private'" class="P_Share" style="height:20px"><i>不公開<br></i></div>
      <div v-else class="P_Share" style="white-space: pre-wrap">{{ p.share.text }}</div>
    </div>
  </div>
</template>

<script>
import { memberApi } from '../api';
import { classNames, errorText } from '../util';

export default {
  data() { return { p: null, error: '', classNames }; },
  computed: {
    aboutRows() {
      const a = this.p.about;
      return [
        { label: '生日', value: a.birth }, { label: '組別', value: a.eGroup },
        { label: '興趣', value: a.interest.join('、') }, { label: '活動地區', value: a.location.join('、') },
        { label: '專業領域', value: a.specialty.join('、') }, { label: '擔任幹部', value: a.cadre.join('、') },
        { label: '社團', value: a.society.join('、') }, { label: '他校學歷', value: a.oSchool }
      ];
    }
  },
  watch: { '$route.params.id'() { this.load(); } },
  created() { this.load(); },
  methods: {
    async load() {
      this.p = null; this.error = '';
      try { this.p = (await memberApi.profile(this.$route.params.id)).data; }
      catch (error) {
        const code = error.response && error.response.data && error.response.data.code;
        this.error = code === 'not_approved' ? '通過審核才能使用此功能' : errorText(error, '無法讀取資料。');
      }
    }
  }
};
</script>

<style>
#P_All { background: linear-gradient(135deg, rgba(252,255,244,1) 0%, rgba(233,233,206,1) 100%); }
#P_All #head {
  overflow: auto; border: 1px solid black; border-bottom-right-radius: 15px; border-bottom-left-radius: 15px;
  background: linear-gradient(135deg, rgba(136,191,232,1) 0%, rgba(112,176,224,1) 100%);
  box-shadow: 5px 5px 5px rgba(100,100,100,0.5); margin: 0 0 15px 0;
}
#P_All #head.female { background: linear-gradient(135deg, rgba(254,187,187,1) 0%, rgba(252,164,164,1) 100%); }
#PImg { float: left; margin: 10px 0; width: 25%; }
#PImg img { max-width: 100%; }
#Pname { float: left; font-size: 40px; margin: 10px 0px; width: 75%; height: 50px; line-height: 50px; text-align: left; }
#PLearn { float: left; font-size: 20px; margin: 10px 0px; width: 72%; height: 30px; line-height: 30px; text-align: left; padding: 0 0 0 3%; }
.P_File { clear: both; width: 90%; background-color: white; text-align: left; margin: 10px 0px; overflow: auto; }
.P_File_Title {
  font-size: 20px; height: 40px; line-height: 40px; text-align: left; padding: 0 0 0 10px;
  background-image: linear-gradient(291deg, rgba(252,252,252,0.66), rgba(247,247,247,0.66) 3%, rgba(242,242,242,0.66) 12%, rgba(217,217,217,0.66) 90%, rgba(191,191,191,0.66));
}
.P_S_Title { float: left; font-size: 15px; margin: 10px 0px 10px 10%; width: 20%; height: 20px; line-height: 20px; text-align: left; }
.P_S_Data { float: left; font-size: 15px; margin: 10px 0px 10px 0px; width: 70%; height: 20px; line-height: 20px; text-align: left; }
.P_Share { float: left; font-size: 15px; margin: 10px 0px 10px 10%; width: 80%; height: 300px; line-height: 20px; text-align: left; overflow: auto; }
.Myhr { width: 80%; }
</style>

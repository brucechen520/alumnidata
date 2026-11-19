<template>
  <div>
    <p v-if="!shell.approved || notApproved">通過審核才能使用此功能</p>
    <template v-else>
      <div style="text-align: left">
        <router-link v-for="tab in tabs" :key="tab.t" :to="tab.t ? { path: '/directory', query: { t: tab.t } } : '/directory'">{{ tab.label }} </router-link>
      </div>
      <template v-if="type">
        <br>搜尋<input id="iSearch" v-model.lazy="keyword">
      </template>
      <template v-if="type === 'work' || type === 'rwork'"><br>(只顯示開放服務單位資訊會員)</template>
      <p v-if="error">{{ error }}</p>
      <div>
        <template v-for="(g, gi) in visibleGroups">
          <div :key="'c' + gi" style="clear:both;"></div>
          <div :key="'g' + gi" class="PGroup">
            <div class="STitle">【{{ kindLabel[g.kind] }}】{{ g.level }}</div>
            <div style="clear:both;"></div>
            <template v-for="m in g.members">
              <div v-if="type === ''" :key="m.id" class="PersonalDataBlock">
                <router-link :to="'/profile/' + m.id"><img class="PersonPic" :src="'/ee/images/Nopic.jpg'"></router-link><br>
                {{ m.name }}<template v-if="m.uClass !== null && m.uClass !== undefined">({{ classNames[m.uClass] }})</template>
              </div>
              <div v-else :key="m.id" class="personline" style="text-align:left;">
                <router-link :to="'/profile/' + m.id">{{ m.name }}</router-link><template v-if="type === 'work'">{{ ' ' }} : {{ m.unit }}</template>
                <template v-else-if="type === 'rwork'">{{ ' ' }}{{ m.items.join(',') }}</template>
                <template v-else>{{ m.items.join(',') }}</template>
              </div>
            </template>
          </div>
        </template>
        <div style="clear:both;"></div>
      </div>
    </template>
  </div>
</template>

<script>
import { memberApi } from '../api';
import { classNames } from '../util';

export default {
  props: ['shell'],
  data() {
    return {
      groups: [], error: '', notApproved: false, keyword: '', classNames,
      kindLabel: { U: '大學部', M: '碩士班', D: '博士班', S: '在職專班' },
      tabs: [
        { t: '', label: '一般' }, { t: 'int', label: '興趣' }, { t: 'loc', label: '活動地區' }, { t: 'spe', label: '專長' },
        { t: 'soc', label: '社團' }, { t: 'cad', label: '擔任幹部' }, { t: 'work', label: '服務公司' }, { t: 'rwork', label: '曾就職公司' }
      ]
    };
  },
  computed: {
    type() { return typeof this.$route.query.t === 'string' ? this.$route.query.t : ''; },
    // 與舊頁面的前端篩選相同：搜尋字串須出現在該列文字中；篩選時隱藏沒有符合者的級別
    visibleGroups() {
      const s = this.keyword;
      if (this.type === '' || s === '') {
        return this.type === '' ? this.groups : this.groups.filter(g => g.members.length);
      }
      const text = m => m.name + ' ' + (m.unit !== undefined ? ': ' + m.unit : (m.items || []).join(','));
      return this.groups.map(g => ({ ...g, members: g.members.filter(m => text(m).includes(s)) })).filter(g => g.members.length);
    }
  },
  watch: { '$route.query.t'() { this.load(); } },
  created() { this.load(); },
  methods: {
    async load() {
      this.keyword = '';
      if (!this.shell.approved) return;
      try { this.groups = (await memberApi.directory(this.type)).data.groups; this.error = ''; }
      catch (error) {
        if (error.response && error.response.data && error.response.data.code === 'not_approved') this.notApproved = true;
        else this.error = (error.response && error.response.data && error.response.data.message) || '無法讀取資料。';
      }
    }
  }
};
</script>

<style>
.PersonalDataBlock { float: left; margin: 5px; }
.PersonPic { width: 80px; height: 80px; }
div.STitle {
  text-align: left; clear: both; height: 30px; font-size: 20px; line-height: 30px; padding-left: 10px;
  background: linear-gradient(135deg, rgba(191,210,85,1) 0%, rgba(142,185,42,1) 28%, rgba(114,170,0,1) 74%, rgba(158,203,45,1) 100%);
}
</style>

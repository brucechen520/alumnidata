<template>
  <div style="text-align: left">
    <template v-for="(tab, i) in tabs"><router-link :key="tab.t" :to="tab.t ? { path: '/statistics', query: { t: tab.t } } : '/statistics'">{{ tab.label }}</router-link><template v-if="true"> | </template></template>
    <br>
    <p id="stitle">{{ title }}</p>
    <br>
    <div v-if="!show" style="cursor: pointer; color:red; font-size:25px;" @click="show = true">按此顯示詳細統計數據~</div>
    <br>
    <table v-show="show" id="Stable"><tbody>
      <tr><th>No.</th><th>名稱</th><th>人數</th></tr>
      <tr v-for="(r, i) in rows" :key="i"><td>{{ i + 1 }}</td><td>{{ r.name }}</td><td>{{ r.count }}</td></tr>
    </tbody></table>
    <p v-if="error">{{ error }}</p>
    <div ref="chart" id="svgBlock"></div>
  </div>
</template>

<script>
import { memberApi } from '../api';
import { drawPie } from '../drawPie';
import { errorText } from '../util';

export default {
  data() {
    return {
      title: '', rows: [], show: false, error: '',
      tabs: [
        { t: 'int', label: '興趣統計' }, { t: 'loc', label: '活動地區統計' }, { t: 'spe', label: '專長統計' },
        { t: '', label: '目前服務單位統計' }, { t: 'rwork', label: '曾經服務單位統計' }, { t: 'ws', label: '各級填寫狀況(大學部)' }
      ]
    };
  },
  computed: {
    type() { return typeof this.$route.query.t === 'string' ? this.$route.query.t : ''; }
  },
  watch: { '$route.query.t'() { this.load(); } },
  created() { this.load(); },
  methods: {
    async load() {
      this.show = false; this.error = '';
      try {
        const data = (await memberApi.statistics(this.type)).data;
        this.title = data.title;
        this.rows = data.rows;
        // 與舊頁面相同：前 9 名各自一格，其餘加總為「其他」
        const dataset = [];
        const itemName = [];
        let rest = 0;
        data.rows.forEach((r, i) => {
          if (i < 9) { dataset.push(r.count); itemName.push(r.name); } else { rest += r.count; }
        });
        dataset.push(rest);
        itemName.push('其他');
        const mod = await import('../vendor/d3.v3.js');
        const d3 = mod.default || mod;
        await this.$nextTick();
        if (this.$refs.chart) drawPie(d3, this.$refs.chart, dataset, itemName);
      } catch (error) { this.error = errorText(error, '無法讀取統計資料。'); }
    }
  }
};
</script>

<style>
#Stable tr:nth-child(odd) { background-color: #ffa6ff; }
#Stable tr:nth-child(even) { background-color: #a6b5ff; }
#stitle { font-size: 20px; margin: 10px; }
</style>

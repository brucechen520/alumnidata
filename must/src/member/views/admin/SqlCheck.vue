<template>
  <div>
    <router-link to="/admin/sql-check">列出重複填寫的資料</router-link>
    <router-link to="/admin/sql-check?t=1">列出未被刪除的多餘資料</router-link>
    <p v-if="error">{{ error }}</p>
    <template v-if="orphan">
      <br>Mem_FB資料表中多餘的資料序號<br>
      <table class="stable"><tbody><tr><td>序號</td></tr><tr v-for="r in fb" :key="r.id"><td>{{ r.id }}</td></tr></tbody></table>
      <br>Mem_Account資料表中多餘的資料序號<br>
      <table class="stable"><tbody><tr><td>序號</td></tr><tr v-for="r in account" :key="r.id"><td>{{ r.id }}</td></tr></tbody></table>
    </template>
    <table v-else class="stable"><tbody>
      <tr><td>姓名</td><td>序號</td></tr>
      <tr v-for="r in duplicate" :key="r.id"><td><router-link :to="'/profile/' + r.id">{{ r.name }}</router-link></td><td>{{ r.id }}</td></tr>
    </tbody></table>
  </div>
</template>

<script>
import { adminApi } from '../../api';
import { errorText } from '../../util';

export default {
  data() { return { duplicate: [], fb: [], account: [], error: '' }; },
  computed: { orphan() { return this.$route.query.t === '1'; } },
  watch: { '$route.query.t': 'load' },
  created() { this.load(); },
  methods: {
    async load() {
      this.error = '';
      try {
        if (this.orphan) {
          this.fb = (await adminApi.sqlCheck('orphan-fb')).data.rows;
          this.account = (await adminApi.sqlCheck('orphan-account')).data.rows;
        } else {
          this.duplicate = (await adminApi.sqlCheck('duplicate')).data.rows;
        }
      } catch (error) { this.error = errorText(error, '無法讀取資料。'); }
    }
  }
};
</script>

<style scoped>
.stable tr:nth-child(even) { background-color: #ffa6ff; }
.stable tr:nth-child(odd) { background-color: #a6b5ff; }
</style>

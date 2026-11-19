<template>
  <div>
    修改紀錄表
    <p v-if="error">{{ error }}</p>
    <table class="orange"><tbody>
      <tr><th></th><th style="width:50px;">修改時間</th><th>修改人</th><th>修改內容</th></tr>
      <tr v-for="l in logs" :key="l.no" :class="{ odd: l.no % 2 === 1 }">
        <td>{{ l.no }}</td>
        <td>{{ time(l.time) }}</td>
        <td><router-link :to="'/profile/' + l.memberId">{{ l.name }}</router-link></td>
        <td><template v-for="(line, i) in l.lines"><br v-if="i > 0" :key="'b' + i">{{ line }}</template></td>
      </tr>
    </tbody></table>
    <br>
    <router-link to="/admin/sql-check">列出重複填寫的資料</router-link>
  </div>
</template>

<script>
import { adminApi } from '../../api';
import { formatTime, errorText } from '../../util';

export default {
  data() { return { logs: [], error: '' }; },
  async created() {
    try { this.logs = (await adminApi.changeLog()).data.logs; }
    catch (error) { this.error = errorText(error, '無法讀取修改紀錄。'); }
  },
  methods: { time: formatTime }
};
</script>

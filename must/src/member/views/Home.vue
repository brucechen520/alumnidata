<template>
  <div>
    公布欄
    <table class="orange"><tbody>
      <tr><th></th><th style="width:300px;">標題</th><th>發表時間</th></tr>
      <tr v-for="(m, i) in messages" :key="m.id" :class="{ odd: (i + 1) % 2 === 1 }">
        <td>{{ i + 1 }}</td>
        <td><router-link :to="'/message/' + m.id">{{ m.topic }}</router-link></td>
        <td>{{ format(m.time) }}</td>
      </tr>
    </tbody></table>
    <p v-if="error">{{ error }}</p>
    <br>
  </div>
</template>

<script>
import { memberApi } from '../api';
import { formatTime, errorText } from '../util';

export default {
  data() { return { messages: [], error: '' }; },
  async created() {
    try { this.messages = (await memberApi.messages()).data.messages; }
    catch (error) { this.error = errorText(error, '無法讀取公佈欄。'); }
  },
  methods: { format: formatTime }
};
</script>

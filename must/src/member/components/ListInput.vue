<template>
  <span>
    <template v-for="(item, index) in value">
      <img v-if="index > 0 || removeFirst" :key="'d' + index" :src="'/ee/image/del.png'" width="20" height="20" style="cursor: pointer" @click="remove(index)"><br v-if="index > 0 || removeFirst" :key="'b' + index">
      <input :key="'i' + index" type="text" :class="inputClass" :value="item" @input="update(index, $event.target.value)">
    </template>
  </span>
</template>

<script>
// 舊頁面的「可增加欄位」輸入：每個欄位一個文字框，新增的欄位前面有刪除圖示
export default {
  props: { value: Array, inputClass: String, removeFirst: Boolean },
  methods: {
    update(index, text) {
      const next = this.value.slice();
      next[index] = text;
      this.$emit('input', next);
    },
    remove(index) {
      const next = this.value.slice();
      next.splice(index, 1);
      this.$emit('input', next);
    }
  }
};
</script>

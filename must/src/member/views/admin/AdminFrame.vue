<template>
  <div class="admin-legacy">
    <p v-if="!shell.isAdmin">權限不足：只有管理員可以使用此功能。</p>
    <router-view v-else :shell="shell"></router-view>
  </div>
</template>

<script>
export default { props: { shell: { type: Object, required: true } } };
</script>

<style>
/* visual4tab.css 的 `* { border: 0; padding: 0 }` 會讓表格格線與表單控制項的預設邊框消失；
   舊後台頁沒有載入該檔，這裡還原瀏覽器預設樣式，使版面與舊頁一致（issue 006） */
.admin-legacy table[border="1"] { border: 1px outset #333; border-spacing: 2px; }
.admin-legacy table[border="1"] td, .admin-legacy table[border="1"] th { border: 1px inset #333; padding: 1px; vertical-align: baseline; }
.admin-legacy input, .admin-legacy textarea, .admin-legacy select, .admin-legacy button { border: revert; padding: revert; }
</style>

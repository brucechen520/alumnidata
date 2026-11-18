<template>
  <div class="hello-world">
    {{msg}}
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      msg: '老MMMMMMM'
    }
  },
  methods:{
  closenav(){
    $('#myNavbar').collapse('hide')
  },
},
}
</script>

<style>
    .hello-world {
      color:red;
    }
</style>
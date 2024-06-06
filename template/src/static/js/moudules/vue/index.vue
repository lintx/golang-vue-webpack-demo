<template>
    <div class="text-center mt-3">
        {{message}},{{gomessage}}
    </div>
</template>

<script>
    export default {
      name: "index",
      data(){
        return {message: "vue message",gomessage:"vue get go message:"+window.__godata.message}
      }
    }
</script>

<style scoped>

</style>
<template>
    <textarea 
    autocomplete="off"
    autocorrect="off" 
    autocapitalize="off" 
    spellcheck="false"/>
</template>


<script>
    export default {
        name: 'BigText',
    }
</script>

<style scoped>
    textarea {
        border: 2px solid steelblue;
        resize: none;
        overflow: hidden;
        font-size:12px;
    }
</style>

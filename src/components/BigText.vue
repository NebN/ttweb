<template>
    <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :class="{
        bad: bad
    }"
    wrap="off"
    autocomplete="off"
    autocorrect="off" 
    autocapitalize="off" 
    spellcheck="false"/>
</template>


<script>
    export default {
        name: 'BigText',
        props: [
            'bad',
            'modelValue' // this name is specifically needed to work with v-model on custom components
        ]
    }
</script>

<style scoped>
    textarea {
        font-family: 'Fira Code';
        border: solid #1d3557;
        resize: none;
        overflow: auto;
        font-size:12px;
        outline: none;
    }

    textarea.bad {
      border: solid #e63946;
      font-size:20px;
    }
</style>

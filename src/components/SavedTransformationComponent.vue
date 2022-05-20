<template>
  <n-card 
  :class="{selected: selected, dirty: dirty}"  
  @click="onClick">
    <n-space vertical> 
      <div class="name">{{ name }}{{dirty?" *":""}}</div>
    </n-space>
  </n-card>
</template>


<script setup>
  import { ref } from 'vue'

  const props = defineProps({
      name: '',
      selected: false,
      dirty: false
  })

  const emit = defineEmits(
    ['selected']
  )

  function onClick() {
    emit('selected')
  }

</script>

<style scoped>
  .name {
    font-weight: bolder;
    font-size: medium;
    width: stretch;
    max-width: stretch;
  }

  .n-card {
    cursor: pointer;
  }

  .n-card:hover {
    background-color: rgb(217, 252, 240);
  }

  .selected {
    border: 3px solid #63E2B7FF !important;
  }

  .dirty {
    font-weight: lighter;
    font-style: italic;
    background-color: rgb(255, 254, 213);
  }
</style>

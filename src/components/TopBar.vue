<template>
  <n-page-header title='eXtreme TeXT tools' subtitle='work in progress'>
    <template #extra>
      <n-space justify="end">
        <n-button text size="large" v-if="loggedIn" @click="emit('sign-out')">Sign Out</n-button>
        <n-button text size="large" v-else @click="emit('sign-in')">Sign In</n-button>
      </n-space>
    </template>
  </n-page-header>
</template>


<script setup>
  defineProps({
    loggedIn: false
  })

  const emit = defineEmits([
    'sign-in', 'sign-out'
  ])
  
</script>

<style scoped>
</style>

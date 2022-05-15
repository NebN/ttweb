<template>
  <n-page-header title='eXtreme TeXT tools' subtitle='work in progress'>
    <template #extra>
      <n-space justify="end">
        <n-popconfirm v-if="loggedIn"
          @positive-click="emit('sign-out')">
          <template #trigger>
            <n-button text size="large" >Sign Out</n-button>
          </template>
          Sign out?
        </n-popconfirm>
        <n-button text size="large" v-else @click="emit('sign-in')">Sign In</n-button>
      </n-space>
    </template>
  </n-page-header>
</template>


<script setup>
  defineProps({
    loggedIn: false
  })

  function onSignOut() {

  }

  const emit = defineEmits([
    'sign-in', 'sign-out'
  ])
  
</script>

<style scoped>
</style>

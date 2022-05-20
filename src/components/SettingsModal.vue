<template>
  <n-modal >
    <n-card title="Settings">
      <n-space vertical>
      Coming soon!
      <n-button @click="userStore.showSettings = false">OK</n-button>
      </n-space>
    </n-card>
  </n-modal>
</template>

<script setup>
  import { ref } from 'vue'
  import { useUserStore } from '@/script/stores/userStore'

  const userStore = useUserStore()

</script>

<style scoped>
.n-card {
  max-width: 400px;
}
.n-button {
  width: stretch;
}
</style>

<template>
  <n-modal >
    <n-card title="Edit Transformation" >
        <n-form-item label="Name">
          <n-input type="text" 
          :maxlength="100"
          v-model:value="tStore.selectedTab.name" 
          @keydown.enter.prevent="onConfirm" />
        </n-form-item>
        <n-space justify="space-around" >
          <n-button strong secondary type="primary" @click="onConfirm">OK</n-button>
          <!--n-button strong secondary type="error" @click="tStore.showEdit = false">Cancel</n-button-->
          <n-alert v-if="errorMessage"
          title="Error" 
          type="error"> {{ errorMessage }} </n-alert>
        </n-space>
    </n-card>
  </n-modal>
</template>

<script setup>
  import { ref } from 'vue'
  import { useTStore } from '@/script/stores/transformationStore'

  const tStore = useTStore()
  const errorMessage = ref('')

  function onConfirm() {
    tStore.showEdit = false
    tStore.edit()
  }

  function diplayError(error) {
    switch(error.code) {
      default: // TODO ?
        console.log('uncaught error code ' + error)
        errorMessage.value = 'An unexpected error has occured, please try again.'
    }
  }
</script>

<style scoped>
.n-card {
  max-width: 400px;
}
.n-button {
  width: stretch;
}
</style>

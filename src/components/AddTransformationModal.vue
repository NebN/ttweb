<template>
  <n-modal >
    <n-card title="New Transformation" >
        <n-form-item label="Name">
          <n-input type="text" 
          v-model:value="name" 
          :maxlength="100"
          placeholder="Your transformation's name" 
          @keydown.enter.prevent="onConfirm" />
        </n-form-item>
        <n-space justify="space-around" >
          <n-button strong secondary type="primary" @click="onConfirm">Confirm</n-button>
          <n-button strong secondary type="error" @click="tStore.showAdd = false">Cancel</n-button>
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
import { stringIsEmpty } from '../script/utils';

  const tStore = useTStore()
  const name = ref('')
  const errorMessage = ref('')

  function onConfirm() {
    if (!stringIsEmpty(name.value)) {
      tStore.newTab(name.value)
    }
    tStore.showAdd = false
    name.value = ''
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

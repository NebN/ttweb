<template>
  <n-modal >
    <n-card title="Transformation" >
        <n-form-item label="Name">
          <n-input type="text" 
          v-model:value="nameRef" 
          placeholder="Your transformation's name" 
          @keydown.enter="onConfirm" />
        </n-form-item>
        <n-space justify="space-around" >
          <n-button strong secondary type="primary" @click="onConfirm">Confirm</n-button>
          <n-button strong secondary type="error" @click="onCancel">Cancel</n-button>
          <n-alert v-if="errorMessage"
          title="Error" 
          type="error"> {{ errorMessage }} </n-alert>
        </n-space>
    </n-card>
  </n-modal>
</template>

<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    name: ''
  })

  const nameRef = ref(props.name)

  const errorMessage = ref("")

  const emit = defineEmits(
    ['confirm', 'cancel']
  )

  function onConfirm() {
    emit('confirm', nameRef.value)
    nameRef.value = null
  }

  function onCancel() {
    emit('cancel')
    nameRef.value = null
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

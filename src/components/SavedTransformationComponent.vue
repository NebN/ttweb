<template>
    <EditTransformationModal 
    @confirm="onEditConfirmed"
    @cancel="onEditCancelled"
    v-model:show="showEdit"
    :name="name" />
    <n-modal
    v-model:show="showDelete"
    preset="dialog"
    title="Delete Transformation?"
    content="This cannot be undone."
    positive-text="Confirm"
    negative-text="Cancel"
    @positive-click="deleteConfirmed"
    @negative-click="deleteCancelled"
    />
  <n-card 
  :class="{selected: selected, dirty: dirty}"  
  @click="onClick"
  @mouseover="showButtons=true" 
  @mouseleave="showButtons=false"> 
    <n-space vertical> 
      <div class="name">{{ name }}{{dirty?" *":""}}</div>
      <n-collapse-transition :show="showButtons||selected">
      <n-space justify="space-around" size="small">
        <n-button @click.stop="onDelete">
          <template #icon>
            <Delete16Filled />  
          </template>
        </n-button>
        <n-button @click.stop="onEdit">
          <template #icon>
            <Edit16Filled />  
          </template>
        </n-button>
        <n-button @click.stop="onSave" :disabled="disabled" >
          <template #icon depth="5">
            <n-icon :component="Save16Filled" /> 
          </template>
        </n-button>
        <!--n-button secondary type="primary" @click.stop="onPlay">
          <template #icon>
            <Play16Filled />  
          </template>
        </n-button-->
      </n-space>
      </n-collapse-transition>
    </n-space>
  </n-card>
</template>


<script setup>
  import { Edit16Filled } from '@vicons/fluent'
  import { Play16Filled } from '@vicons/fluent'
  import { Delete16Filled } from '@vicons/fluent'
  import { Save16Filled } from '@vicons/fluent'
  import { ref } from 'vue'

  import EditTransformationModal from './EditTransformationModal'

  const showButtons = ref(false)
  const disabled = ref(false)

  const showEdit = ref(false)
  const showDelete = ref(false)

  const props = defineProps({
      name: '',
      selected: false,
      dirty: false
  })

  const emit = defineEmits([
    'selected', 'delete', 'save', 'play', 'edit'
  ])

  function onClick() {
    emit('selected')
  }

  function onDelete() {
    showDelete.value = true
  }

  function deleteConfirmed() {
    showDelete.value = false
    emit('delete')
  }
  
  function deleteCancelled() {
    showDelete.value = false
  }

  function onEdit() {
    showEdit.value = true
  }

  function onEditConfirmed(newName) {
    showEdit.value = false
    emit('edit', newName)
  }

  function onEditCancelled() {
    showEdit.value = false
  }

  function onSave() {
    emit('save')
  }
  
  function onPlay() {
    emit('play')
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

  .selected {
    background-color: aliceblue;
  }

  .dirty {
    font-weight: lighter;
    font-style: italic;
  }
</style>

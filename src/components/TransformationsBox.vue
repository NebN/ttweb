<template>
    <EditTransformationModal 
    @confirm="onConfirm"
    @cancel="onCancel"
    v-model:show="showTransformationAdd"
    :name="''" />
    <div id="transformations">
      <SavedTransformationComponent
      v-for="t in savedTransformationChains" 
      :key="t.name" 
      :name="t.name"
      :selected="t.selected"
      :dirty="t.dirty"
      @selected="onSelected(t)"
      @delete="onDelete(t)"
      @save="onSave(t)"
      @edit="onEdit(t, $event)"
      @play="onPlay(t)"
      />
    </div>
    <n-card :bordered="false" >
      <n-space justify="space-around" size="small">
        <n-button @click="onAdd" style="font-size: 28px">
          <n-icon>
            <AddCircle24Regular />
          </n-icon>
        </n-button>
       </n-space>
    </n-card>
</template>

<script setup>
  import { ref } from "vue"
  import SavedTransformationComponent from "./SavedTransformationComponent"
  import { AddCircle24Regular } from "@vicons/fluent"
  import { TransformationChain } from "@/script/model"
  import EditTransformationModal from "./EditTransformationModal"

  defineProps({
    savedTransformationChains: {
      type: Array,
      default: []
    }
  })

  const emit = defineEmits(
    ['selected', 'save', 'delete', 'play', 'edit', 'add']
  )

  const currentlySelected = ref(null)
  const showTransformationAdd = ref(false)


  function onSelected(t) {
    if (!currentlySelected.value || currentlySelected.value.id != t.id) {
      currentlySelected.value = t
      emit('selected', t)
    }
  }

  function onEdit(t, newName) {
    emit('edit', t, newName)
  }

  function onDelete(t) {
    emit('delete', t)
  }
  
  async function onSave(t) {
    emit('save', t)
  }

  function onPlay(t) {
    emit('play', t)
  }

  function onAdd() {
    showTransformationAdd.value = true
  }

  function onCancel() {
    showTransformationAdd.value = false
  }

  function onConfirm(n) {
    showTransformationAdd.value = false
    emit('add', n)
  }
    
</script >

<style scoped>
</style>

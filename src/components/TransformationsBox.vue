<template>
    <n-scrollbar :style="`max-height: ${height}px`">
      <SavedTransformationComponent
      v-for="t in tabs" 
      :key="t.id" 
      :name="t.name"
      :selected="t.selected"
      :dirty="t.isDirty()"
      @selected="onSelected(t)"
      @delete="onDelete(t)"
      @save="onSave(t)"
      @edit="onEdit(t, $event)"
      @play="onPlay(t)"
      />
    <n-card :bordered="false" >
      <n-space justify="space-around" size="small">
        <n-button @click="tStore.showAdd = true" style="font-size: 28px">
          <n-icon>
            <AddCircle24Regular />
          </n-icon>
        </n-button>
       </n-space>
    </n-card>
    </n-scrollbar>
</template>

<script setup>
  import { storeToRefs } from "pinia"
  import { useWindowSize } from 'vue-window-size'
  import { useTStore } from "@/script/stores/transformationStore.js"
  import SavedTransformationComponent from "./SavedTransformationComponent"
  import { AddCircle24Regular } from "@vicons/fluent"

  const tStore = useTStore()
  const { tabs } = storeToRefs(tStore)

  const props = defineProps({
    height: 0
  })

  function onSelected(t) {
    tStore.selectTab(t)
  }

</script>

<style scoped>
    
</style>

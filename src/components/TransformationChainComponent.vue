<template>
  <div id="container">
    <LineOfcodeComponent
    v-for="(line, index) in lines" :key="line.id"
    :ref="el => { divs[index] = el }"
    :lineOfCode="lines[index]"
    @keydown="onInput"
    @keydown.enter="onEnter(line, index)"
    @keydown.delete="onDelete(line, index, $event)" 
    @blur="onFocusLost(index)"
    @keydown.up.prevent="onUpArrow(index)"
    @keydown.down.prevent="onDownArrow(index)" />
  </div>
</template>


<script setup>
  import { ref, onBeforeUpdate, nextTick } from 'vue'
  import { storeToRefs } from 'pinia'
  import LineOfcodeComponent from './LineOfCodeComponent'
  import { LineOfCodeModel } from '@/script/model.js'
  import { useTStore } from '@/script/stores/transformationStore.js'

  const tStore = useTStore()

  tStore.$onAction(({ name, after }) => {
    if (name === 'selectTab') {
      after(() => {
        lines.value = tStore.selectedTab.lines
      })
    }
  })

  const lines = ref(tStore.selectedTab.lines)
  const divs = ref([])
  const show = ref(true)

  function onInput() {
    infoContentL1.value = 'nice jok lul xd'
    show.value = false
  }
  const infoTitle = ref('')
  const infoContentL1 = ref('Start typing to get suggestions and explanations')
  const infoContentL2 = ref('example:')
  const infoContentL3 = ref('grep "error"')

  onBeforeUpdate(() => {
    divs.value = []
  })

  function onEnter(line, index) {

    if (divs.value[index].isEmpty()) {
      // do not add a line if current line is blank
      return
    } 
    
    const nextIndex = index + 1 
      if (lines.value.length > nextIndex) { // if there are more lines after
        for (let i = nextIndex; i < lines.value.length; i++) {
          const ithLine = lines.value[i]
          if (ithLine.isEmpty() || (ithLine.isError())) { // look for an empty one (or one with an error)
            divs.value[i].focusInput() // and focus it
            return
          }
        }
      } 

    lines.value.push(new LineOfCodeModel('')) // otherwise just add a new one (that will auto-focus)
  }

  function onDelete(line, index, event) {
    if (divs.value[index].isEmpty() && lines.value.length > 1) {
      // do not remove a line until the current line is blank
      // and never remove the last remaining line

      // must prevent this otheriwse newly focused line is going to have a character deleted
      

      const previousIx = index == 0 ? 1 : index - 1
      divs.value[previousIx].focusInput()

      // because we prevented the event's default behaviour
      // we have to manually remove the div reference that no longer exists
      if (event.key == 'Backspace') {
        event.preventDefault() 
        nextTick(() => {
          divs.value = divs.value.filter(d => d != null)
        })
      }
    }
  } 

  function onFocusLost(index) {
    const line = divs.value[index]
    if (line && line.isEmpty() && index < lines.value.length - 1) {
      lines.value.splice(index, 1)
    }
  }

  function onUpArrow(index) {
    const newIndex = index == 0 ? lines.value.length -1 : index - 1
    divs.value[newIndex].focusInput() 
  }

  function onDownArrow(index) {
    const newIndex = index == lines.value.length - 1 ? 0 : index + 1
    divs.value[newIndex].focusInput() 
  }

</script>

<style scoped>

.info-card {
  margin-bottom: 4px;
  --n-font-size: 16px !important;
  white-space: pre-line;
  min-height: 102px;
}

</style>

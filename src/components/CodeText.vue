<template>
  <div id="container">
    <LineOfCode
    v-for="(line, index) in lines" :key="line.id" :id="line.id"
    :ref="el => { divs[index] = el }"
    v-model:code="line.code"
    v-model:transformation="line.transformation"
    :index="index"
    :partialResult="line.partialResult"
    @keydown.enter="onEnter(line, index)"
    @keydown.delete="onDelete(line, index, $event)" 
    @blur="onFocusLost(index)"
    @keydown.up.prevent="onUpArrow(index)"
    @keydown.down.prevent="onDownArrow(index)" />
  </div>
</template>


<script>
import { ref, onBeforeUpdate, nextTick, computed } from 'vue'
import LineOfCode from './LineOfCode'
import { stringIsEmpty } from '@/uils.js'

export default {
  name: "CodeText",

  components: {
    LineOfCode
  },

  setup(_, context) {
    
    let lastId = 0

    function newLine() {
      return {
        id: lastId++,
        code: '',
        transformation: null,
        partialResult: null,
        lineRef: null
      }
    }

    const lines = ref([newLine()])
    const divs = ref([])

    const completeTransformation = computed(() => {
      const usablelines = lines.value.filter(l => !stringIsEmpty(l.code) && l.transformation != null)
      if (usablelines.length > 0) {
        return usablelines.map(l => l.transformation).reduce((a, b) => a.chain(b))
      }
    })

    function getTransformation() {
      return completeTransformation.value
    }

    context.expose({ getTransformation })

    onBeforeUpdate(() => {
      divs.value = []
    })

    function onEnter(line, index) {
      if (!stringIsEmpty(line.code)) { // do not add a line if current line is blank
        
        if (lines.value.length >= index) { // if there are more lines after
          for (let i = index; i < lines.value.length; i++) {
            if (stringIsEmpty(lines.value[i].code)) { // look for an empty one
              divs.value[i].focusInput() // and focus it
              return
            }
          }
        } 

        lines.value.push(newLine()) // otherwise just add a new one (that will auto-focus)
      }
    }

    function onDelete(line, index, event) {
      if (stringIsEmpty(line.code) && lines.value.length > 1) { 
        // do not remove a line until the current line is blank
        // and never remove the last remaining line

        // must prevent this otheriwse newly focused line is going to have a character deleted
        event.preventDefault() 

        lines.value.splice(index, 1)
        const previousIx = index == 0 ? 0 : index - 1
        divs.value[previousIx].focusInput(event)

        // because we prevented the event's default behaviour
        // we have to manually remove the div reference that no longer exists
        nextTick(() => {
          divs.value = divs.value.filter(d => d != null)
        })
      }
    } 

    function onFocusLost(index) {
      const line = lines.value[index]
      if (stringIsEmpty(line.code) && index < lines.value.length - 1) {
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
    
    return {
      lines,
      divs,
      onEnter,
      onDelete,
      onFocusLost,
      onUpArrow,
      onDownArrow
    }
  } 

}

</script>

<style scoped>

</style>

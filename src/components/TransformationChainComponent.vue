<template>
  <div id="container">
    <LineOfcodeComponent
    v-for="(line, index) in lines" :key="line.id" :id="line.id"
    :ref="el => { divs[index] = el }"
    :lineOfCode="lines[index]"
    @keydown.enter="onEnter(line, index)"
    @keydown.delete="onDelete(line, index, $event)" 
    @blur="onFocusLost(index)"
    @keydown.up.prevent="onUpArrow(index)"
    @keydown.down.prevent="onDownArrow(index)" />
  </div>
</template>


<script setup>
  import { ref, onBeforeUpdate, nextTick, watch } from 'vue'
  import LineOfcodeComponent from './LineOfCodeComponent'
  import { LineOfCodeModel } from '@/script/model.js'
  import { arrayEquals } from '@/script/utils.js'


  let lastId = 0

  function newLine(code) {
    return new LineOfCodeModel(
      lastId++,
      code
    )
  }

  const lines = ref([newLine('')])
  const divs = ref([])

  // TODO caching
  function getTransformationChain() {
    const usableLines = lines.value.map(l => l.getTransformation()).filter(t => t != null)
    if (usableLines.length == 0) {
      return null
    } else {
      return usableLines.reduce((a, b) => a.chain(b))
    }
  }

  function setLines(transformation) {
    lines.value = transformation.lines.map((line) => {
      return newLine(line)
    })
  }

  function getLines() {
    return lines.value.map((l) => {
      return l.getCode()
    })
  }

  defineExpose({ getTransformationChain: getTransformationChain, setLines: setLines, getLines: getLines })

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

    lines.value.push(newLine('')) // otherwise just add a new one (that will auto-focus)
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

</style>

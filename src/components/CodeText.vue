<template>
  <div id="container">
    <LineOfCode 
    :ref="setLineRef"
    v-for="(line, index) in lines" :key="line.id" :id="line.id"
    v-model:code="line.code"
    :index="index"
    :transformation="line.transformation"
    :partialResult="line.partialResult"
    :isError="line.isError"
    :isEmpty="line.isEmpty"
    @keydown.enter="onEnter(line, index)"
    @keydown.delete="onDelete(line, index, $event)" 
    @blur="onFocusLost(index)"
    @keydown.up.prevent="onUpArrow(index)"
    @keydown.down.prevent="onDownArrow(index)"
    @parse-transformation="parseTransformation(line)" />
  </div>
</template>


<script>
import { ref, onBeforeUpdate, onUpdated } from 'vue'
import LineOfCode from './LineOfCode'
import transformations from '@/transformations.js'

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
        isError() { return this.transformation != null && this.transformation.error != null },
        isEmpty() { return this.code == null || this.code.length == 0 || this.code.trim().length == 0 }
      }
    }

    const lines = ref([newLine()])

    let lineRefs = []

    const setLineRef = el => {
      if (el) {
        lineRefs.push(el)
      }
    }
    onBeforeUpdate(() => {
      lineRefs = []
    })
    onUpdated(() => {
      lineRefs.forEach(lr => console.log(lr.code))
    })


    function onEnter(line, index) {
      if (!line.isEmpty()) { // do not add a line if current line is blank
        
        if (lines.value.length >= index) { // if there are more lines after
          for (let i = index; i < lines.value.length; i++) {
            if (lines.value[i].isEmpty()) { // look for an empty one
              lineRefs[i].focusInput() // and focus it
              return
            }
          }
        } 

        lines.value.push(newLine()) // otherwise just add a new one (that will auto-focus)
      }
    }

    // FIXME lineRef gets messed up when deleting a line that is not at the end
    // when a line is deleted the part after the line gets inverted in the lineRef
    // example:
    // - line 1
    // - line 2
    // - line 3
    // - line 4
    // - line 5
    // delete line 2, result:
    // - line 1
    // - line 5
    // - line 4
    // - line 3
    function onDelete(line, index, event) {
      if (line.isEmpty() && lines.value.length > 1) { 
        // do not remove a line until the current line is blank
        // and never remove the last remaining line

        // must prevent this otheriwse newly focused line is going to have a character deleted
        event.preventDefault() 
        
        lines.value.splice(index, 1)
        // lineRefs.splice(index, 1) mutating this in place caused some problems
        //const adjustedLineRefs = lineRefs.slice(0,index).concat(lineRefs.slice(index+1))
        //const previousIx = index == 0 ? 0 : index - 1
        //adjustedLineRefs[previousIx].focusInput()
        const previousIx = index == 0 ? 0 : index - 1
        lineRefs[previousIx].focusInput()
      }
    } 

    function onFocusLost(index) {
      const line = lines.value[index]
      if (line.isEmpty() && index < lines.value.length - 1) {
        lines.value.splice(index, 1)
      }
    }

    function onUpArrow(index) {
      const newIndex = index == 0 ? lineRefs.length -1 : index - 1
      console.log('upArrow ' + index + ' -> ' + newIndex, lineRefs)
      lineRefs[newIndex].focusInput()   
    }

    function onDownArrow(index) {
      const newIndex = index == lineRefs.length - 1 ? 0 : index + 1
      lineRefs[newIndex].focusInput()   
    }
    
    function parseTransformation(line) {
      if (!line.isEmpty()) {
        line.transformation = transformations.parseTransformation(line.code)
      } else {
        // console.log('line is empty')
      }
      executeTransformation()
    }

    function executeTransformation() {
      const usablelines = lines.value.filter(l => !l.isEmpty() && l.transformation != null)
      if (usablelines.length > 0) {
        const t = usablelines.map(l => l.transformation)
          .reduce((a, b) => a.chain(b))
        
        context.emit('apply-transformation', t)
      }
    }

    return {
      lines,
      setLineRef,
      onEnter,
      onDelete,
      onFocusLost,
      onUpArrow,
      onDownArrow,
      parseTransformation
    }
  } 

}

</script>

<style scoped>

#container {
  background-color: white;
  position: relative;
}

</style>

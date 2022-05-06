<template>
  <div>
    <div id ="div-code" >
      <input
        v-focus
        v-model="code"
        ref="inputRef"
        placeholder="your code here"
        autocomplete="off"
        spellcheck="false"
        autocorrect="off" 
        autocapitalize="off" 

        :class="{ 
          editing: editing,
          error: !editing && !selected && isError, 
          errorSelected: !editing && selected && isError,
          ok: !editing && !selected && !isError && !isEmpty,
          okSelected: !editing && selected && !isError && !isEmpty
        }"

        @blur="onFocusLost"
        @focus="onFocusGained"
        @input="onInput"
        
      />
      <button v-for="flag in flags" :key="flag.label" 
      class="btn-flag"
      :class="{'flag-on': flag.active}"
      @click="onFlagClicked(flag)"> 
      {{ flag.label }} </button>
    </div>
    <div v-if="showSuggestions" class="autocomplete-box">
      <div v-for="suggestion in suggestions" :key="suggestion"
      class="autocomplete-item" 
      @click="suggestionClicked(suggestion)"
      >
        {{  suggestion }}
      </div>
    </div>
  </div>

</template>

<script>
import transformations from '@/transformations.js'
import { stringIsEmpty } from '@/uils.js'
import { nextTick, ref, reactive, watch, toRef, computed } from 'vue'

export default {
  name: 'LineOfCode',

  props: {
    id: Number,
    code: String,
    index: Number,
    transformation: Object,
    partialResult: String
  },

  setup(props, context) {

    const inputRef = ref(null)
    const editing = ref(false)
    const selected = ref(false)
    
    const code = toRef(props, 'code')
    const transformation = toRef(props, 'transformation')
    
    const isEmpty = computed(() =>{
      return stringIsEmpty(code.value)
    })

    const isError = computed(() => {
      return transformation.value != null && transformation.value.error
    })

    const textWhenLastEdited = ref('')
    const showSuggestions = ref(false)

    const possibleTransformations = transformations.transformations.map(t => t.keyword)

    const suggestions = ref([])

    const flags = reactive(props.transformation != null ? props.transformation.flags : []) 

    function focusInput(e) {
      console.log(e)
      if (e) {
        e.preventDefault()
      }
      inputRef.value.focus()
    }

    context.expose({ focusInput })

    function onFocusLost(event) {
      selected.value = false
      editing.value = false
      const newText = event.target.value
      if (textWhenLastEdited.value != newText) {
        context.emit('blur')
        if (!stringIsEmpty(newText)) {
          const transformation = transformations.parseTransformation(newText)
          context.emit('update:transformation', transformation)
        } else {
          // console.log('line is empty')
        }
        textWhenLastEdited.value = newText
      }
      nextTick(() => showSuggestions.value = false)
    }

    function onFocusGained() {
      selected.value = true
    }

    function onInput(event) {
      showSuggestions.value = true
      const codeValue = event.target.value
      
      if (codeValue.trim().length > 0) {
        suggestions.value = possibleTransformations.filter(t => t.startsWith(codeValue) && t != codeValue)
      } else {
        suggestions.value = []
      }

      editing.value = textWhenLastEdited.value != codeValue
      context.emit('update:code', codeValue)

    }

    function suggestionClicked(suggestion) {
      context.emit('update:code', suggestion)
    }

    function onFlagClicked(flag) {
      flag.active = !flag.active
    }

    return {
      inputRef,
      selected,
      editing,
      onFocusLost,
      onFocusGained,
      onInput,
      suggestions,
      suggestionClicked,
      showSuggestions,
      flags,
      onFlagClicked,
      isEmpty,
      isError
    }
  }
}
</script>

<style scoped>

#div-code {
  width: stretch;
  display: flex;
}

.btn-flag {
  flex-grow: 1;
  font-size: 16px;
  color: lightgrey;
  background-color: dimgrey;
}

.flag-on {
  font-weight: bolder;
  color: yellow;
}

input {
  font-family: 'Fira Code';
  border: 1px solid black;
  padding: 6px;
  margin: 0;
  overflow: hidden;
  font-size: 16px;
  flex-grow: 30;
  outline: none;
  border-width: 0;
}

input:focus {
  font-size: 20px;
}

.error {
  background-color: #e63946;
  color: white
}

.errorSelected {
  background-color: coral;
}

.ok {
  background-color: #457b9d;
  color: white
}

.okSelected {
  background-color: #cddde7;
}

.editing {
  background-color: #ffffff;
}

.autocomplete-box {
  position: absolute;
  display: block;
  width: 25%;
}

.autocomplete-item {
  padding: 5px;
  background-color: white;
  color: black;
  border: black 1px solid;
  text-align: left;
  cursor: pointer;
}

.autocomplete-item:hover {
   background-color: lightgrey;
}
</style>
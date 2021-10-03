<template>
  <div>
    <input
      v-focus
      :value="code"
      ref="in"
      placeholder="your code here"
      autocomplete="off"
      spellcheck="false"
      autocorrect="off" 
      autocapitalize="off" 

      :class="{ 
        editing: editing,
        error: !editing && !selected && isError(), 
        errorSelected: !editing && selected && isError(),
        ok: !editing && !selected && !isError() && !isEmpty(),
        okSelected: !editing && selected && !isError() && !isEmpty()
      }"

      @blur="onFocusLost($event)"
      @focus="onFocusGained"
      @input="onInput($event)"
      
    />
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
import { nextTick, ref } from 'vue'

export default {
  name: 'LineOfCode',
  methods: {
    focusInput() {
      this.$refs.in.focus()
    }
  },
  setup(_, context) {
    
    let editing = ref(false)
    let selected = ref(false)
    let textWhenLastEdited = ref('')
    let showSuggestions = ref(false)

    let possibleTransformations = transformations.keywords

    let suggestions = ref([])

    function onFocusLost(event) {
      selected.value = false
      editing.value = false
      if (textWhenLastEdited.value != event.target.value) {
        context.emit('blur')
        context.emit('parse-transformation')
        textWhenLastEdited.value = event.target.value
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

    return {
      selected,
      editing,
      onFocusLost,
      onFocusGained,
      onInput,
      suggestions,
      suggestionClicked,
      showSuggestions
    }
  },
  props: {
    id: Number,
    index: Number,
    code: String,
    transformation: Object,
    partialResult: String,
    isError: Function,
    isEmpty: Function
  }
}
</script>

<style scoped>
input {
  font-family: monospace;
  border: 1px solid black;
  padding: 6px;
  margin: 0;
  overflow: hidden;
  font-size: 16px;
  width: stretch;
}
input:focus {
  font-size: 22px;
}

.error {
  background-color: #d9534f;
  color: white
}

.errorSelected {
  background-color: coral
}

.ok {
  background-color: #5cb85c;
  color: white
}

.okSelected {
  background-color: palegreen
}

.editing {
  background-color: #5bc0de
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
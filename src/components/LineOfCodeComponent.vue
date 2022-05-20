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
          error: !editing && !selected && lineOfCode.isError(), 
          errorSelected: !editing && selected && lineOfCode.isError(),
          ok: !editing && !selected && !lineOfCode.isError() && !lineOfCode.isEmpty(),
          okSelected: !editing && selected && !lineOfCode.isError() && !lineOfCode.isEmpty()
        }"

        @blur="onFocusLost"
        @focus="onFocusGained"
        @input="onInput"
        @enter="blur()"
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

<script setup>
  import { transformations } from '@/script/transformations.js'
  import { LineOfCodeModel } from '@/script/model.js'
  import { stringIsEmpty } from '@/script/utils.js'
  import { ref, reactive } from 'vue'
import { useTStore } from '../script/stores/transformationStore';

  const props = defineProps({
    lineOfCode: LineOfCodeModel
  })

  const emit = defineEmits(
    ['blur', 'input']
  )

  const tStore = useTStore()

  const inputRef = ref(null)
  const editing = ref(false)
  const selected = ref(false)
  const textWhenLastEdited = ref('')
  const code = ref(props.lineOfCode.getCode())

  const showSuggestions = ref(false)
  const possibleTransformations = transformations.map(t => t.keyword)
  const suggestions = ref([])
  const flags = reactive(props.transformation != null ? props.transformation.flags : []) 

  function focusInput() {
    inputRef.value.focus()
  }

  function isEmpty() {
    return stringIsEmpty(code.value)
  }

  defineExpose({ focusInput: focusInput, isEmpty: isEmpty })

  function onFocusLost() {
    selected.value = false
    editing.value = false
    if (textWhenLastEdited.value != code.value) {
      props.lineOfCode.setCode(code.value)
      textWhenLastEdited.value = code.value
      emit('blur')
    }
  }

  function onFocusGained() {
    selected.value = true
  }

  function onInput() {
    editing.value = textWhenLastEdited.value != code.value
  }

  function onFlagClicked(flag) {
    flag.active = !flag.active
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
  font-size: 14px;
  flex-grow: 30;
  outline: none;
  border-width: 0;
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
  background-color: #6a91a8;
  color: white
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
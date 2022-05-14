<template>
  <div class="containerDiv">
    <n-progress v-if="loading" type="circle" :percentage="percentage" />
    <textarea v-else
    v-model="textAreaValue"
    ref="textAreaRef"
    @input="onInput"
    :class="{
        bad: bad
    }"
    wrap="off"
    autocomplete="off"
    autocorrect="off" 
    autocapitalize="off" 
    spellcheck="false"/>
  </div>
</template>


<script setup>
  import { ref, nextTick } from 'vue'

  const props = defineProps({
    bad: false,
    loading: false,
    percentage: 0
  })

  const maxChars = 750000
  const textAreaValue = ref('')
  const textAreaRef = ref()

  class OverflowableText {
    _shownText = ''
    _overflowText = ''

    constructor(maxLength) {
      this.maxLength = maxLength
    }

    setCompleteText(text) {
      this._shownText = text.slice(0, this.maxLength)
      this._overflowText = text.slice(this.maxLength)
    }

    updateShownText(newShownText) {
      if (newShownText.length <= 1) {
        this.setCompleteText(newShownText)  
      } else {
        this.setCompleteText(newShownText + this._overflowText)
      }
    }

    shownText() {
      return this._shownText
    }

    getCompleteText() {
      return this._shownText + this._overflowText
    }

    toString() {
      return this._shownText + '\n~~~~~~~~~~~~~\n' + this._overflowText
    }
  }

  const overflowableText = new OverflowableText(maxChars)

  function onInput(e) {
    const cursorPosition = textAreaRef.value.selectionEnd
    overflowableText.updateShownText(textAreaValue.value)
    textAreaValue.value = overflowableText.shownText()
    nextTick(() =>{
      textAreaRef.value.selectionEnd = cursorPosition
    })
  }

  function getText() {
    return overflowableText.getCompleteText()
  }

  function setText(text) {
    overflowableText.setCompleteText(text)
    textAreaValue.value = overflowableText.shownText()
  }

  defineExpose({ getText: getText, setText: setText})
            
</script>

<style scoped>
  .containerDiv {
    display: inline-flex;
  }

  .n-progress {
    margin: auto;
    align-self: center;
  }

  textarea {
    font-family: 'Fira Code';
    resize: none;
    overflow: auto;
    font-size:12px;
    outline: none;
    width: stretch;
  }

  textarea.bad {
    border: solid #e63946;
    font-size:20px;
  }

</style>

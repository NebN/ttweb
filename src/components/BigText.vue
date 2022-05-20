<template>
    <!--n-progress v-if="loading" type="circle" :percentage="percentage" /-->
    <n-spin :show="loading" size="large" >
      <textarea 
      v-model="textAreaValue"
      :readonly="readonly"
      ref="textAreaRef"
      @input="onInput"
      :class="{
          loading: loading
      }"
      wrap="off"
      autocomplete="off"
      autocorrect="off" 
      autocapitalize="off" 
      spellcheck="false"
      :placeholder="placeholder"/>
      <template #description>
        {{ loadingDescription }}
      </template>
    </n-spin>
</template>


<script setup>
  import { ref, nextTick } from 'vue'
  import { useTStore } from '@/script/stores/transformationStore'

  const props = defineProps({
    bad: false,
    loading: false,
    percentage: 0,
    loadingDescription: '',
    readonly: false,
    maxChars: 0,
    placeholder: ''
  })

  const tStore = useTStore()

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

  const overflowableText = new OverflowableText(props.maxChars)

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
  .n-spin-container {
    display: grid;
    grid-template-areas: "content";
  }

  .n-spin-container :deep(.n-spin-content) {
    display: grid;
    grid-area: "content";
    grid-template-areas: "text";
  }

  .n-spin-container .n-spin-content textarea {
    grid-area: "text";
    font-family: 'Fira Code';
    resize: none;
    overflow: auto;
    font-size:12px;
    outline: none;
  }
  textarea.loading {
    opacity: 0.3;
  }

</style>

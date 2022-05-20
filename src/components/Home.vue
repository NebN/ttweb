<template>
    <div class="main">
    
    <SignInModal 
    v-model:show="userStore.showSignIn" />

    <SettingsModal 
    v-model:show="userStore.showSettings" />

    <EditTransformationModal 
    v-model:show="tStore.showEdit"/>

    <AddTransformationModal 
    v-model:show="tStore.showAdd"/>

    <n-modal
    v-model:show="tStore.showDelete"
    preset="dialog"
    :title="'Delete ' + tStore.selectedTab.name + '?'"
    content="This cannot be undone."
    positive-text="Confirm"
    negative-text="Cancel"
    @positive-click="tStore.delete()"
    />

    <TopBar id="top"/>

    <SidePanel id="sidePanel"/>

    <TrasformationChainComponent 
    id="transformationChainArea"
    ref="transformationChainRef" />
    
    <BigText
    id="inputTextArea" 
    :readonly="false"
    :loadingDescription="'Loading your file'"
    @input="onInput"
    ref="inputTextRef"
    :loading="inputLoading"
    :percentage="inputLoadingPercentage"
    :maxChars="maxChars"
    :placeholder="'your text here'" />

    <BigText id="outputTextArea" 
    ref="outputTextRef"
    :readonly="true"
    :loadingDescription="'Running transformations'"
    :loading="outputLoading"
    :maxChars="maxChars"/>

    <BottomBar id="bottom"
    @upload-text="uploadText"
    @upload-text-progress="uploadTextProgress"
    @copy-output="copyOutput"
    @download-output="downloadOutput" />

    </div>
</template>

<script setup>
import { useMessage } from 'naive-ui'
import { ref, watch, onMounted, h, } from 'vue'
import { collection, doc, setDoc, deleteDoc, updateDoc, getDocs } from '@firebase/firestore'
import { db } from '@/main.js'
import { storeToRefs } from 'pinia'
import { serializeTransformation } from '@/script/transformations.js'
import { renderMessage, stringIsEmpty } from '@/script/utils.js'
import transformationWorker from '@/script/transformation-worker';
import TopBar from './TopBar.vue'
import BigText from './BigText.vue'
import TrasformationChainComponent from './TransformationChainComponent.vue'
import SidePanel from './SidePanel.vue'
import Loader from './Loader.vue'
import BottomBar from './BottomBar.vue'
import SignInModal from './SignInModal.vue'
import SettingsModal from './SettingsModal.vue'
import EditTransformationModal from './EditTransformationModal.vue'
import AddTransformationModal from './AddTransformationModal.vue'
import { useTStore } from '@/script/stores/transformationStore.js'
import { useUserStore } from '@/script/stores/userStore.js'


//nMounted(() =>{ 
  //window.addEventListener('beforeunload', beforeUnloadListener)
//})

const tStore = useTStore()
const userStore = useUserStore()

const message = useMessage()
const savedTransformationChains = ref([])
const currentTransformation = ref()

const inputTextRef = ref()
const inputLoading = ref(false)
const inputLoadingPercentage = ref(0)
const outputTextRef = ref()
const outputLoading = ref(false)
const maxChars = ref(1000000)

function onInput() {
  executeCurrentTransformationChain()
}

const { transformation } = storeToRefs(tStore)

watch(transformation, (newTC, oldTC) => {
  if (newTC && !newTC.equals(oldTC)) {
    executeCurrentTransformationChain()
  }
})

onMounted(() => {
  transformationWorker.worker.onmessage = e => {
    outputTextRef.value.setText(e.data)
    outputLoading.value = false
  }
})

function executeCurrentTransformationChain() {
  if (!inputTextRef.value || !outputTextRef.value || stringIsEmpty(inputTextRef.value.getText())) {
    return
  }

  const t = tStore.transformation

  if (t) {
    outputLoading.value = true
    console.log('executing', t.toString())
    const text = inputTextRef.value.getText()
    transformationWorker.send({ transformation: serializeTransformation(t), input: text })
  } else {
    outputTextRef.value.setText('')
  }

}

function uploadText(text, filename) {
  if (text.length > maxChars.value) {
    const localeString = maxChars.value.toLocaleString(undefined, { minimumFractionDigits: 0 })
    message.info('The file you uploaded exceedes ' + localeString + 
    ' characters.\nOnly the first ' + localeString +
    ' characters will be displayed', {
      render: renderMessage,
      duration: 100000,
      closable: true
    })
  }

  inputTextRef.value.setText(text)
  inputLoading.value = false
  inputLoadingPercentage.value = 0
  message.success('Uploaded ' + filename + '!', {
      render: renderMessage,
      duration: 2500,
      closable: true
  })
  executeCurrentTransformationChain()
}

function uploadTextProgress(progress) {
  inputLoading.value = true
  inputLoadingPercentage.value = progress
}

function copyOutput() {  
  if (!outputTextRef.value.getText()) {
    message.warning('Output is empty!', {
      render: renderMessage,
      duration: 2000,
      closable: true
  })} else {
    navigator.clipboard.writeText(outputTextRef.value.getText())
    message.info('Copied!', {
      render: renderMessage,
      duration: 2000,
      closable: true
    })
  }
}

function downloadOutput() {
  if (!outputTextRef.value.getText()) {
    message.warning('Output is empty!', {
      render: renderMessage,
      duration: 2000,
      closable: true
  })} else {
    const blob = new Blob([ outputTextRef.value.getText() ], { "type" : "text/plain" });
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    const name = currentTransformation.value ? '_' + currentTransformation.value.name : ''
    link.download = 'xtxt' + name +'.txt'
    link.click()
  }
}

</script>

<style>

html { 
  overflow-y: hidden
}

body {
  min-height: 100vh;
}

.main {
  padding: 0px;
  display:grid;
  grid-template-areas: 
    "top-bar top-bar top-bar"
    "side code code"
    "side input output"
    "side bottom-bar bottom-bar";
  grid-template-rows: auto auto 1fr auto;
  grid-template-columns: 1fr 2.15fr 2.15fr;
  gap: 0px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

#sidePanel {
  grid-area: side;
}

#transformationChainArea {
  grid-area: code;
}

#inputTextArea {
  grid-area: input;
}

#outputTextArea {
  grid-area: output;
}

#top {
  grid-area: top-bar;
  padding: 10px;
}

#bottom {
  grid-area: bottom-bar;
}

#inputTextArea {
  border-width: 2px 1px 2px 2px;
}

#outputTextArea {
  border-width: 2px 2px 2px 1px;
}

</style>

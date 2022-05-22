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

    <TopBar 
    id="top"
    ref="topBarRef"/>

    <SidePanel id="sidePanel"
    :sidePanelHeight=sidePanelHeight
    @play="onPlay"/>

    <TrasformationChainComponent 
    id="transformationChainArea"
    ref="transformationChainRef" />
    
    <div id="inputArea">
      <BigText 
      v-if="tStore.selectedMode!=='file'"
      id="inputTextArea"
      :readonly="false"
      :loadingDescription="'Loading your file'"
      @input="onInput"
      ref="inputTextRef"
      :loading="inputLoading"
      :percentage="inputLoadingPercentage"
      :maxChars="maxChars"
      :placeholder="'your text here'" />
      <n-upload v-else id="inputUploadArea" 
      :show-file-list="false" 
      :default-upload="true"
      @before-upload="onBeforeUpload" >
        <n-upload-dragger >
          <div style="margin-bottom: 12px">
          <n-icon size="48" :depth="3">
            <ArrowUpload20Filled />
          </n-icon>
        </div>
        <n-text style="font-size: 16px">
          Click or drag a file to this area to upload
        </n-text>
        </n-upload-dragger>
      </n-upload>
    </div>
    

    <BigText id="outputTextArea" 
    ref="outputTextRef"
    :readonly="true"
    :loadingDescription="'Running transformations'"
    :loading="outputLoading"
    :maxChars="maxChars"/>

    <BottomBar id="bottom"
    v-if="tStore.selectedMode !== 'file'"
    @upload-text="uploadText"
    @upload-text-progress="uploadTextProgress"
    @copy-output="copyOutput"
    @download-output="downloadOutput" />

    </div>
</template>

<script setup>
import { ref, watch, onMounted, h, computed } from 'vue'
import { c, useMessage } from 'naive-ui'
import { useWindowSize } from 'vue-window-size'
import { collection, doc, setDoc, deleteDoc, updateDoc, getDocs } from '@firebase/firestore'
import { ArrowUpload20Filled } from '@vicons/fluent'
import { db } from '@/main.js'
import { storeToRefs } from 'pinia'
import { serializeTransformation } from '@/script/transformations.js'
import { renderMessage, stringIsEmpty, readFile } from '@/script/utils.js'
import transformationWorker from '@/script/transformation-worker';
import TopBar from './TopBar.vue'
import BigText from './BigText.vue'
import TrasformationChainComponent from './TransformationChainComponent.vue'
import SidePanel from './SidePanel.vue'
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

const topBarRef = ref(null)
const inputTextRef = ref()
const inputLoading = ref(false)
const inputLoadingPercentage = ref(0)
const outputTextRef = ref()
const outputLoading = ref(false)
const maxChars = ref(1000000)

const { height } = useWindowSize()

const topBarHeight = computed(() => {
  if (topBarRef.value != null) {
    return topBarRef.value.height()
  }
  return 0
})

// TODO this whole computing of sizes is kind of ugly, a Pinia store for the layout might be a good idea
const sidePanelHeight = computed(() => {
  return height.value - topBarHeight.value
})

function onInput() {
  if (tStore.selectedMode === 'auto') {
    executeCurrentTransformationChain()
  }
}

const { transformation } = storeToRefs(tStore)
const { selectedMode } = storeToRefs(tStore)

watch(selectedMode, (newM, oldM) => {
  if (newM == 'auto') {
    executeCurrentTransformationChain()
  }
})

watch(transformation, (newTC, oldTC) => {
  if (tStore.selectedMode === 'auto' && newTC && !newTC.equals(oldTC)) {
    executeCurrentTransformationChain()
  }
})

onMounted(() => {
  transformationWorker.worker.onmessage = e => {
    if (tStore.selectedMode !== 'file') {
      outputTextRef.value.setText(e.data)
    } else {
      downloadString(e.data)
    }
    
    outputLoading.value = false
  }
})

function onPlay() {
  executeCurrentTransformationChain()
}

function executeCurrentTransformationChain(input) {
  if (!input && !inputTextRef.value || !outputTextRef.value) {
    return
  }

  const text = input || inputTextRef.value.getText()
  if (stringIsEmpty(text)) {
    return
  }

  const t = tStore.transformation

  outputLoading.value = true
  console.log('executing', t.toString())
  transformationWorker.send({ transformation: serializeTransformation(t), input: text })

}

function onBeforeUpload(e) {
  readFile(e.file.file, content => uploadText(content, e.file.name))
}

function uploadText(text, filename) {
  if (tStore.selectedMode !== 'file') {
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
  }

  switch (tStore.selectedMode) {
    case 'auto':
      executeCurrentTransformationChain()
      break
    case 'file':
      executeCurrentTransformationChain(text)
      break
    default:
      break
  }
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

function downloadString(string) {
  const blob = new Blob([ string ], { "type" : "text/plain" });
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = 'xtxt_' + tStore.selectedTab.name.replace(' ', '_') +'.txt'
  link.click()
}

function downloadOutput() {
  if (!outputTextRef.value.getText()) {
    message.warning('Output is empty!', {
      render: renderMessage,
      duration: 2000,
      closable: true
  })} else {
    downloadString(outputTextRef.value.getText())
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

#inputArea {
  grid-area: input;
  display: grid;
  grid-template-areas: "input-content";
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
}

#inputTextArea {
  grid-area: input-content;
  border-width: 2px 1px 2px 2px;
}

#inputUploadArea {
  grid-area: input-content;
  display: grid;
  grid-template-areas: "trigger";
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
}

div.n-upload-trigger {
  grid-area: trigger;
  display: grid;
  grid-template-areas: "dragger";
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
}

div.n-upload-trigger.n-upload-dragger {
  grid-area: dragger;
}

#outputTextArea {
  grid-area: output;
  border-width: 2px 2px 2px 1px;
}

#top {
  grid-area: top-bar;
  padding: 10px;
}

#bottom {
  grid-area: bottom-bar;
}

</style>

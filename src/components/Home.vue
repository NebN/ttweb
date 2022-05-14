<template>
    <div class="main">
    
    <SignInModal v-model:show="showSignIn" />

    <TopBar id="top"
    :loggedIn="loggedIn"
    @sign-in="signIn"
    @sign-out="logOut"/>

    <SidePanel id="sidePanel"
    :savedTransformationChains="savedTransformationChains"
    :loggedIn="loggedIn"
    @sign-in="signIn"
    @selected="onSelected"
    @save="onSave"
    @delete="onDelete"
    @edit="onEdit"
    @add="onAdd"/>

    <TrasformationChainComponent id="codeTextArea"
    ref="codeTextRef" />
    
    <BigText
    id="inputTextArea" 
    @input="onInput"
    ref="inputTextRef"
    :loading="inputLoading"
    :percentage="inputLoadingPercentage"
    placeholder="your text here" />

    <BigText id="outputTextArea" 
    ref="outputTextRef"
    :loading="outputLoading"
    :percentage="outputLoadingPercentage"
    readonly
    :bad="illegalTransformation"
    v-model="outputText"/>

    <BottomBar id="bottom"
    @upload-text="uploadText"
    @upload-text-progress="uploadTextProgress"
    @copy-output="copyOutput"
    @download-output="downloadOutput"
    :userRef="userRef"
    :loggedIn="loggedIn"> </BottomBar>

    </div>
</template>

<script setup>
import { useMessage, NAlert } from 'naive-ui'
import { ref, watch, onMounted, computed, h, nextTick } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from "@firebase/auth"
import { collection, doc, setDoc, deleteDoc, updateDoc, getDocs } from '@firebase/firestore'
import { db } from '@/main.js'
import { serializeTransformation } from '@/script/transformations.js'
import { TransformationChain } from '@/script/model.js'
import { arrayEquals } from '@/script/utils.js'
import transformationWorker from '@/script/transformation-worker';
import TopBar from './TopBar.vue'
import BigText from './BigText.vue'
import TrasformationChainComponent from './TransformationChainComponent.vue'
import SidePanel from './SidePanel.vue'
import Loader from './Loader.vue'
import BottomBar from './BottomBar.vue'
import SignInModal from './SignInModal.vue'

function beforeUnloadListener(event) {
  if (savedTransformationChains.value.some(t => t.dirty)) {
    event.returnValue = 'Unsaved changes will be lost'
  } 
}

//nMounted(() =>{ 
  //window.addEventListener('beforeunload', beforeUnloadListener)
//})

const message = useMessage()
const userRef = ref()
const loggedIn = computed(() => {
  return Boolean(userRef.value)
})
const showSignIn = ref(false)
const savedTransformationChains = ref([])
const currentTransformation = ref()

function logOut() {
  signOut(getAuth()).then(() => {
    // ok
  }).catch((error) => {
    console.log('error on logout ' + error)
  });
}

function signIn() {
  showSignIn.value = true
}

const renderMessage = (props) => {
    const { type } = props;
    return h(NAlert, {
        closable: props.closable,
        onClose: props.onClose,
        type: type === "loading" ? "default" : type,
        title: props.content,
        style: {
        boxShadow: "var(--n-box-shadow)",
        maxWidth: "calc(100vw - 32px)",
        width: "480px"
        },
    }, {
        default: () => null
    });
};

onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    userRef.value = user
    setupUser(user)
  } else {
    userRef.value = null
  }
});

async function setupUser(user) {
  const transformations = await getDocs(collection(db, 'users', user.uid, 'transformations'))
  savedTransformationChains.value = []
  transformations.forEach((t) => {
    const data = t.data()
    savedTransformationChains.value.push(
      new TransformationChain({
        id: t.id,
        name: data.name,
        lines: data.lines
      })
    )
  })
}

const inputTextRef = ref()
const inputLoading = ref(false)
const inputLoadingPercentage = ref(0)
const outputTextRef = ref()
const outputLoading = ref(false)
const outputLoadingPercentage = ref(0)
const inputText = ref("")
const outputText = ref("")

const codeTextRef = ref()
const illegalTransformation = ref(false)

const lines = computed(() => {
  if (codeTextRef.value) {
    return codeTextRef.value.getLines()
  }
})

function onInput() {
  executeCurrentTransformationChain()
}

watch(lines, async (newLines, _) => {
  if (currentTransformation.value) {
    currentTransformation.value.lines = newLines
    if (!currentTransformation.value.dirty && !arrayEquals(currentTransformation.value.linesWhenLastSaved, newLines)) {
      currentTransformation.value.dirty = true
    }
  }
})

const currentTransformationChain = computed(() => {
  if (codeTextRef.value) {
    return codeTextRef.value.getTransformationChain()
  }
})

watch(currentTransformationChain, (newTC, oldTC) => {
  if (newTC && !newTC.equals(oldTC)) {
    executeCurrentTransformationChain()
  }
})

watch(currentTransformation, async (newT, oldT) => {
  if (oldT) {
    oldT.selected = false
  }
  codeTextRef.value.setLines(newT)
  newT.selected = true
})

onMounted(() => {
  transformationWorker.worker.onmessage = e => {
    outputTextRef.value.setText(e.data)
    outputLoading.value = false
  }
})

function executeCurrentTransformationChain() {
  if (!codeTextRef.value || !inputTextRef.value || !outputTextRef.value) {
    return
  }

  const t = codeTextRef.value.getTransformationChain()
  if (t) {
    outputLoading.value = true
    console.log('executing', t.toString())
    const text = inputTextRef.value.getText()
    transformationWorker.send({ transformation: serializeTransformation(t), input: text })
    illegalTransformation.value = Boolean(t.error)
  } else {
    outputTextRef.value.setText('')
  }

}

function uploadText(text, filename) {
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
  navigator.clipboard.writeText(outputText.value)
  message.info('Copied!', {
      render: renderMessage,
      duration: 2500,
      closable: true
  })
}

function downloadOutput() {
  if (!outputTextRef.value.getText()) {
    message.warning('Output is empty!', {
      render: renderMessage,
      duration: 2500,
      closable: true
  })
  } else {
    const blob = new Blob([ outputTextRef.value.getText() ], { "type" : "text/plain" });
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    const name = currentTransformation.value ? '_' + currentTransformation.value.name : ''
    link.download = 'xtxt' + name +'.txt'
    link.click()
  }
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1>>>0);
};

function onSelected(t) {
  currentTransformation.value = t
}

async function onSave(t) {
  const lines = codeTextRef.value.getLines()
  if (t.id != null) {
    const tDoc = doc(db, 'users', userRef.value.uid, 'transformations', t.id)
    await setDoc(tDoc, {
      name: t.name,
      lines: lines
    })
  } else {
    const tColl = collection(db, 'users', userRef.value.uid, 'transformations')
    const newTRef = doc(tColl)
    await setDoc(newTRef, {
      name: t.name,
      lines: lines
    })
    t.id = newTRef.id
  }

  t.dirty = false
  t.linesWhenLastSaved = t.lines
  message.success(t.name + ' saved!', {
      render: renderMessage,
      duration: 2500,
      closable: true
  })
}

async function onDelete(t) {
  savedTransformationChains.value = savedTransformationChains.value.filter(x => x != t)
  if (t.id) {
    const tDoc = doc(db, 'users', userRef.value.uid, 'transformations', t.id)
    await deleteDoc(tDoc).then(() => {
      message.info(t.name + ' deleted!', {
        render: renderMessage,
        duration: 2500,
        closable: true
      })
  })
  }
}

async function onEdit(t, newName) {
  for (let i = 0; i < savedTransformationChains.value.length; i++) {
    if (savedTransformationChains.value[i] == t) {
      savedTransformationChains.value[i].name = newName
    }
  }
  if (t.id) {
  const tDoc = doc(db, 'users', userRef.value.uid, 'transformations', t.id)
    await updateDoc(tDoc, {
      name: newName
    }).then(() => {
      message.info(t.name + ' updated!', {
          render: renderMessage,
          duration: 2500,
          closable: true
      })
    })
  }
}

function onAdd(t) {
  const transformation = new TransformationChain({name:t, dirty:true})
  savedTransformationChains.value.push(transformation)
  currentTransformation.value = transformation
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
  grid-template-columns: 1fr 2.5fr 2.5fr;
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

#codeTextArea {
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

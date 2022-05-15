<template>
    <div class="main">
    
    <SignInModal 
    v-model:show="showSignIn"
    @login-complete="onLoginComplete"
    @login-started="onLoginStarted" />

    <TopBar id="top"
    :loggedIn="loggedIn"
    @sign-in="signIn"
    @sign-out="logOut"/>

    <SidePanel id="sidePanel"
    :savedTransformationChains="savedTransformationChains"
    :loading="userLoading"
    :loggedIn="loggedIn"
    @sign-in="signIn"
    @selected="onSelected"
    @save="onSave"
    @delete="onDelete"
    @edit="onEdit"
    @add="onAdd"/>

    <TrasformationChainComponent 
    id="codeTextArea"
    ref="codeTextRef" />
    
    <BigText
    id="inputTextArea" 
    :readonly="false"
    :loadingDescription="'Loading your file'"
    @input="onInput"
    ref="inputTextRef"
    :loading="inputLoading"
    :percentage="inputLoadingPercentage"
    :maxChars="maxChars"
    placeholder="your text here" />

    <BigText id="outputTextArea" 
    ref="outputTextRef"
    :readonly="true"
    :loadingDescription="'Running transformations'"
    :loading="outputLoading"
    :percentage="outputLoadingPercentage"
    :bad="illegalTransformation"
    :maxChars="maxChars"
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
import { onAuthStateChanged, signOut } from "@firebase/auth"
import { collection, doc, setDoc, deleteDoc, updateDoc, getDocs } from '@firebase/firestore'
import { db } from '@/main.js'
import { auth } from '@/main.js'
import { serializeTransformation } from '@/script/transformations.js'
import { TransformationChain } from '@/script/model.js'
import { arrayEquals, stringIsEmpty } from '@/script/utils.js'
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

const localStorageTsLabel = 'unsavedTransformations'

const message = useMessage()
const userRef = ref()
const userLoading = ref(true)
const loggedIn = computed(() => {
  return Boolean(userRef.value) || userLoading.value
})
const showSignIn = ref(false)
const savedTransformationChains = ref([])
const currentTransformation = ref()

function logOut() {
  signOut(auth).then(() => {
    localStorage.removeItem(localStorageTsLabel)
  }).catch((error) => {
    console.log('error on logout ' + error)
  });
}

function signIn() {
  showSignIn.value = true
}

function onLoginStarted() {
  userLoading.value = true
}

function onLoginComplete() {
  userLoading.value = true
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    userRef.value = user
  } else {
    userRef.value = null
  }
  setupUser(user)
  userLoading.value = false
});

function getLocallySavedTransformations() {
  const saved = JSON.parse(localStorage.getItem(localStorageTsLabel))
  if (saved) {
    return saved.filter(t => t.name != 'Untitled Transformation' || t.lines.some(l => !stringIsEmpty(l)))
  } else {
    return []
  }
}

async function setupUser(user) {
  const tsBeforeLogin = getLocallySavedTransformations()
  savedTransformationChains.value = []
  if (user) {
    const transformations = await getDocs(collection(db, 'users', user.uid, 'transformations'))
    for (let i = 0; i < tsBeforeLogin.length; i++) {
      const c = new TransformationChain(tsBeforeLogin[i])
      if (!currentTransformation.value && c.selected) {
        currentTransformation.value = c
      }
      savedTransformationChains.value.push(c)
    }
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
  } else {
    if (tsBeforeLogin && tsBeforeLogin.length > 0) {
      for (let i = 0; i < tsBeforeLogin.length; i++) {
        const c = new TransformationChain(tsBeforeLogin[i])
        if (!currentTransformation.value && c.selected) {
          currentTransformation.value = c
        }
        savedTransformationChains.value.push(c)
      }
      if (!currentTransformation.value) {
        currentTransformation.value = savedTransformationChains.value[0]
      }
    } else {
      const c = new TransformationChain({ 
        dirty: true
      })
    savedTransformationChains.value.push(c)
    currentTransformation.value = c
    }
  }
}

const inputTextRef = ref()
const inputLoading = ref(false)
const inputLoadingPercentage = ref(0)
const outputTextRef = ref()
const outputLoading = ref(false)
const outputLoadingPercentage = ref(0)
const inputText = ref("")
const outputText = ref("")
const maxChars = ref(1000000)

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

watch(savedTransformationChains, async (newT, oldT) => {
  if (!loggedIn.value) {
    localStorage.setItem(localStorageTsLabel, JSON.stringify(newT))
  }
}, { deep: true })


onMounted(() => {
  transformationWorker.worker.onmessage = e => {
    outputTextRef.value.setText(e.data)
    outputLoading.value = false
  }
})

function executeCurrentTransformationChain() {
  if (!codeTextRef.value || !inputTextRef.value || !outputTextRef.value || stringIsEmpty(inputTextRef.value.getText())) {
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

function onSelected(t) {
  console.log('selected', t)
  currentTransformation.value = t
}

async function onSave(t) {
  if (!loggedIn.value) {
    showSignIn.value = true
  } else {
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

      const localStorageTs = getLocallySavedTransformations()
      const foundTs = localStorageTs
        .find(savedT => savedT.id == t.id && savedT.name == t.name && savedT.lines == t.lines && savedT.selected == t.selected)
      const filtered = localStorageTs.filter(ts => ts != foundTs)
      localStorage.setItem(filtered, localStorageTsLabel)

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

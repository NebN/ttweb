<template>
    <div class="main">

    <TopBar id="top"
    :loggedIn="loggedIn"/>

    <SidePanel id="sidePanel"
    :userRef="userRef"
    :loggedIn="loggedIn"/>

    <CodeText id="codeTextArea"
    ref="codeTextRef"
    @apply-transformation="executeTransformation" />

    <BigText id="inputTextArea" 
    placeholder="your text here"
    v-model.lazy="inputText" />

    <BigText id="outputTextArea" 
    readonly
    :bad="illegalTransformation"
    v-model="outputText"/>

    <BottomBar id="bottom"
    @upload-text="uploadText"
    @copy-output="copyOutput"
    @download-output="downloadOutput"
    :userRef="userRef"
    :loggedIn="loggedIn"> </BottomBar>

    </div>
</template>

<script>
import { useMessage, darkTheme, useNotification, NAlert } from 'naive-ui';
import { ref, watch, onMounted, computed, h } from 'vue'
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import TopBar from './TopBar.vue'
import BigText from './BigText.vue'
import CodeText from './CodeText.vue'
import SidePanel from './SidePanel.vue'
import Loader from './Loader.vue'
import transformation from '@/transformations.js'
import BottomBar from './BottomBar.vue'


function beforeUnloadListener(event) {
  // This is apparently enough to show a pop up 
  // warning the user that changes will be lost on reload
}

export default {
  name: 'Page',
  
  components: {
    BigText,
    CodeText,
    SidePanel,
    Loader,
    BottomBar,
    TopBar
  },

  setup() {
    onMounted(() =>{
      //window.addEventListener('beforeunload', beforeUnloadListener)
    })
    
    const message = useMessage()
    const notification = useNotification()
    const userRef = ref()
    const loggedIn = ref(false)

    const renderMessage = (props) => {
        console.log(props)
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
        loggedIn.value = true
        userRef.value = user
      } else {
        loggedIn.value = false
        userRef.value = null
      }
    });

    const inputText = ref("")
    const outputText = ref("")
    const illegalTransformation = ref(false)
    const codeTextRef = ref(null)

    const finalT = computed(() => {
      if (codeTextRef.value) {
        return codeTextRef.value.getTransformation()
      }
    })

    watch(inputText, async (newInput, oldInput) => {
      //if (cyrb53(newInput) != cyrb53(oldInput)) {
      if (true) {
        const t = codeTextRef.value.getTransformation()
        if (t) {
          executeTransformation(t)
        }
      }
    })

    watch(finalT, async (newT, _) => {
      if (newT) {
        executeTransformation(newT)
      }
    })

    function executeTransformation(t) {
      if (t.error) {
        illegalTransformation.value = true
      } else {
        illegalTransformation.value = false
      }
      outputText.value = transformation.transform(t, inputText.value)
    }
    
    function uploadText(text, filename) {
      inputText.value = text
      message.success('Uploaded ' + filename + '!', {
          render: renderMessage,
          duration: 2500,
          closable: true
      })
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
      if (!outputText.value) {
        message.warning('Output is empty!', {
          render: renderMessage,
          duration: 2500,
      })
      } else {
        const blob = new Blob([ outputText.value ], { "type" : "text/plain" });
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'xtxt_output.txt'
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

    return {
      darkTheme,
      inputText,
      outputText,
      codeTextRef,
      executeTransformation,
      uploadText,
      copyOutput,
      downloadOutput,
      illegalTransformation,
      loggedIn,
      userRef
    }
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
    "bottom-bar bottom-bar bottom-bar";
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

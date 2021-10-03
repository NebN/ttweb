<template>
  <div class="main">
    
    <Loader v-if="loading" />

    <SidePanel id="sidePanel"/>

    <CodeText id="codeTextArea" 
    @apply-transformation="executeTransformation" />

    <BigText id="inputTextArea" 
    placeholder="your text here"
    @input="inputText = $event.target.value" />

    <BigText id="outputTextArea" 
    readonly 
    :value="outputText"/>

  </div>
</template>

<script>
import BigText from './components/BigText'
import CodeText from './components/CodeText'
import SidePanel from './components/SidePanel'
import Loader from './components/Loader'
import transformation from '@/transformations.js'


export default {
  name: 'App',
  
  components: {
    BigText,
    CodeText,
    SidePanel,
    Loader
  },

  data() {
    return {
      inputText: null,
      outputText: null,
      loading: false
    }
  },

  methods : {
    executeTransformation(t) {
      this.outputText = transformation.transform(t, this.inputText)
    }
  }

}
</script>

<style>

body {
    min-height: 100vh;
    background-color: grey; 
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.main {
  padding: 10px;
  display:grid;
  grid-template-areas: 
    "side code code"
    "side input output";
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 2fr 2fr;
  gap: 6px;
  background-color: lightgrey;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow: auto;
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
</style>

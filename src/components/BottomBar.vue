<template>
    <div class="bar">
      <n-upload :show-file-list="false" type="file" @change="upload">
        <n-button class="upload"> {{ uploadText }}</n-button>
      </n-upload>
      <div class="vertical-div" v-if="width < 580">
        <n-button class="cpy" @click="copy" >{{ copyText }}</n-button>
        <n-button class="download" @click="downlad" >{{ downloadText }}</n-button>
      </div>
      <div v-else class="horizontal-div">
        <n-button class="cpy" @click="copy" >{{ copyText }}</n-button>
        <n-button class="download" @click="downlad" >{{ downloadText }}</n-button>
      </div>
    </div>
</template>


<script setup>
  import { useWindowSize } from 'vue-window-size';
  import { computed } from 'vue';
  import { readFile } from '@/script/utils.js'

  defineProps({
    userRef: null,
    loggedIn: null
  })

  const { width } = useWindowSize() // TODO width.value < 600 -> icons

  const copyText = computed(() => {
    if (width.value > 900) {
      return 'Copy to Clipboard'
    } else {
      return 'Copy'
    }
  })

  const downloadText = computed(() => {
    if (width.value > 900) {
      return 'Download as File'
    } else {
      return 'Download'
    }
  })

  const uploadText = computed(() => {
    if (width.value > 540) {
      return 'Upload File as Input'
    } else {
      return 'Upload File'
    }
  })

  const emit = defineEmits([
    'copy-output', 'download-output', 'upload-text', 'upload-text-progress'
  ])

  async function upload(data) {
    readFile(
      data.file.file, 
      content => emit('upload-text', content, data.file.name), 
      progress => emit('upload-text-progress', progress)) 
  }

  function copy() {
    emit('copy-output')
  }

  function downlad() {
    emit('download-output')
  }
</script>


<style scoped>
.bar {
  padding: 0px;
  display:grid;
  grid-template-areas: 
    "upload copy-download-div";
  grid-template-rows: auto;
  grid-template-columns: 1fr 1fr;
  gap: 0px;
  justify-content: center;
}

.vertical-div {
  grid-area: copy-download-div;
  display: grid;
  grid-template-areas: 
    "cpy"
    "download";
    grid-template-columns: auto;
    grid-template-rows: 1fr 1fr;
}

.horizontal-div {
  grid-area: copy-download-div;
  display: grid;
  grid-template-areas: 
    "cpy download";
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
}

div.n-upload-trigger {
  grid-area: upload;
}

.cpy {
  grid-area: cpy;
}

.download {
  grid-area: download;
}


</style>

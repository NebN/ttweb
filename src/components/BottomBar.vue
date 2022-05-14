<template>
    <div class="bar">
      <n-upload ref="uploadRef" type="file" @change="upload">
        <n-button class="upload"> {{ uploadText }}</n-button>
      </n-upload>
      <n-button class="cpy" @click="copy" >{{ copyText }}</n-button>
      <n-button class="download" @click="downlad" >{{ downloadText }}</n-button>
    </div>
</template>


<script setup>
  import { useWindowSize } from 'vue-window-size';
  import { ref, nextTick, computed } from 'vue';

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

  const uploadRef = ref()

  async function upload(data) {
    const file = data.file

    const reader = new FileReader(); 
    reader.onprogress = e => emit('upload-text-progress', Math.round((e.loaded * 100) / e.total))
    reader.onload = e => emit('upload-text', e.target.result, file.name)
    reader.readAsText(file.file)
  
    nextTick(() => {
      // do not want to see the name of the file uploaded
      // underneath the button as it messes up the layout
      uploadRef.value.clear()
    })
  }

  function copy() {
    emit('copy-output')
  }

  function downlad() {
    emit('download-output')
  }
</script>

<script>
export default {
  setup() {

  }
}
</script>

<style scoped>
.bar {
  padding: 0px;
  display:grid;
  grid-template-areas: 
    "upload cpy download";
  grid-template-rows: auto;
  grid-template-columns: 2.5fr 1.25fr 1.25fr;
  gap: 0px;
}


.logout {
  grid-area: logout;
}

.upload {
  grid-area: upload;
}

.cpy {
  grid-area: cpy;
}

.download {
  grid-area: download;
}

</style>

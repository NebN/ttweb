<template>
    <div class="bar">
      <div class="logout"></div>
      <n-upload ref="uploadRef" type="file" @change="upload">
        <n-button class="upload">Upload File as Input</n-button>
      </n-upload>
      <n-button class="cpy" @click="copy" >Copy to Clipboard</n-button>
      <n-button class="download" @click="downlad" >Download as File</n-button>
    </div>
</template>


<script setup>
  import { defineProps, defineEmits, defineComponent, ref, nextTick } from 'vue';
  import { useMessage } from 'naive-ui';

  const props = defineProps({
    userRef: null,
    loggedIn: null
  })

  const message = useMessage()

  const emit = defineEmits([
    'copy-output', 'download-output', 'upload-text'
  ])

  const uploadRef = ref()

  function upload(data) {
    const reader = new FileReader();  
    reader.onload = e => emit('upload-text', e.target.result, data.file.name)
    reader.readAsText(data.file.file)
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
    "logout upload cpy download";
  grid-template-rows: auto;
  grid-template-columns: 1fr 2.5fr 1.25fr 1.25fr;
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

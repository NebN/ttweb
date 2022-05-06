<template>
  <div id="box"> {{ name }} </div>
</template>


<script>
import { ref } from "vue"

    export default {
        name: 'SavedTransformation',
        props: {
          name: ''
        },
        setup() {

        }
    }
</script>

<style scoped>

</style>

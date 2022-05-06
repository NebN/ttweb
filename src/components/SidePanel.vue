<template>
  <div id="panel">
    <InfoBox />
    <TransformationsBox v-if="loggedIn" v-model:user="userRef"/>
    <LoginBox v-else />
  </div>
</template>


<script>
  import InfoBox from "./InfoBox"
  import LoginBox from "./LoginBox"
  import TransformationsBox from "./TransformationsBox"

  export default {
    name: "SidePanel",

    props: {
      loggedIn: null,
      userRef: null
    },

    components: {
      InfoBox,
      LoginBox,
      TransformationsBox
    }, 

  }
</script>

<style scoped>

</style>

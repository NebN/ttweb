<template>
  <n-page-header id='asd' title='Extreme Text Tools' subtitle='work in progress'>
    <template #extra>
      <n-space justify="end">
        <n-button  text v-if="loggedIn" @click="logOut">Sign Out</n-button>
      </n-space>
    </template>
  </n-page-header>
</template>


<script setup>
  import { getAuth, signOut } from "@firebase/auth";
  import { defineProps } from "vue";

  defineProps({
    loggedIn: false
  })
  
  function logOut() {
    signOut(getAuth()).then(() => {
      // ok
    }).catch((error) => {
      console.log('error on logout ' + error)
    });
  }

</script>

<style scoped>
</style>

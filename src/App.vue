<template>
  <n-config-provider>
    <n-notification-provider>
      <n-message-provider>

        <Home/>

      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup>
import { onAuthStateChanged, getAuth } from 'firebase/auth'
import { useUserStore } from '@/script/stores/userStore.js'
import Home from './components/Home.vue';

const userStore = useUserStore()
const auth = getAuth()

onAuthStateChanged(auth, (user) => {
  userStore.setUser(user)
});

</script>


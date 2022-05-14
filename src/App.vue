<template>
  <n-config-provider 
  :theme-overrides="{ common: { fontWeightStrong: '600' } }" >
    <n-notification-provider>
      <n-message-provider>

        <Home/>

      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script>
import { NConfigProvider, NMessageProvider, NNotificationProvider } from 'naive-ui';
import { darkTheme } from 'naive-ui'
import Home from './components/Home.vue';

export default {
  name: 'App',
  
  components: {
    NConfigProvider,
    NMessageProvider,
    NNotificationProvider,
    Home
  },

  setup() {

    return {
      darkTheme
    }
  }
}
</script>


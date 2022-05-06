<template>
  <n-config-provider 
    :theme-overrides="{ common: { fontWeightStrong: '600' } }" >
    <n-notification-provider>
      <n-message-provider>

        <Page/>

      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script>
import { NConfigProvider, NMessageProvider, NNotificationProvider } from 'naive-ui';
import { darkTheme } from 'naive-ui'
import Page from './components/Page.vue';

export default {
  name: 'App',
  
  components: {
    NConfigProvider,
    NMessageProvider,
    NNotificationProvider,
    Page
  },

  setup() {

    return {
      darkTheme
    }
  }
}
</script>


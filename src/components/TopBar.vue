<template>
  <n-page-header title='eXtreme TeXT tools' subtitle='work in progress'>
    <template #extra>
      <n-space justify="end">
        <n-spin :show="userStore.loading">
          <span v-if="userStore.isLoggedIn">
            <n-dropdown :options="options" @select="onSelect">
              <n-button quaternary>
                  <n-space>
                    {{ userStore.userName }}
                    <n-avatar
                    size="small"
                    :src="userStore.avatar"
                    />
                </n-space>
              </n-button>
            </n-dropdown>
          </span>
          <n-button text size="large" v-else @click="userStore.showSignIn = true">Sign In</n-button>
        </n-spin>
      </n-space>
    </template>
  </n-page-header>
</template>


<script setup>
  import { ref, h } from 'vue'
  import { NIcon } from 'naive-ui'
  import { Settings24Filled, SignOut24Filled } from '@vicons/fluent'
  import { useUserStore } from '@/script/stores/userStore'
  import { storeToRefs } from 'pinia'

  const userStore = useUserStore()
  const { avatar } = storeToRefs(userStore)

  const renderIcon = (icon) => {
    return () => {
      return h(NIcon, null, {
        default: () => h(icon)
      })
    }
  }

  const options = [
    {
      label: 'Settings',
      key: 'settings',
      icon: renderIcon(Settings24Filled)
    },
    {
      label: 'Sign out',
      key: 'signout',
      icon: renderIcon(SignOut24Filled)
    }
  ]

  function onSelect(key) {
    switch(key) {
      case 'settings':
        userStore.showSettings = true
        break
      case 'signout':
        userStore.signOut()
        break
      default:
        console.log('unknown key', key)
    }
  }

</script>

<style scoped>
.image-button{
    color: v-bind(avatar);
    padding-left: 16px;
    height: 16px;
}
</style>

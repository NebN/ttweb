<template>
  <div ref="div">
    <n-page-header title='eXtreme TeXT tools' subtitle='work in progress'>
      <template #extra>
        <n-space justify="end" size="large">
          <a href="https://github.com/NebN/ttweb">GitHub</a>
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
  </div>
</template>


<script setup>
  import { h, ref, computed } from 'vue'
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

  const div = ref(null)

  function height() {
    if (div.value) {
      return div.value.offsetHeight
    }
    return 0
  }

  defineExpose({
    height: height
  })

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

a {
    color: rgb(22, 22, 22);
    text-decoration: none;
    transition: color .2s;
}

a:hover {
  color: #63E2B7FF
}
</style>

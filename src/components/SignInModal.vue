<template>
  <n-modal >
    <n-card title="Sign In">
      <n-form 
      ref="formRef">
        <!--n-form-item label="Email">
          <n-input type="text" v-model="email" placeholder="Email" />
        </n-form-item>
        <n-form-item label="Password">
          <n-input type="password" v-model="password" placeholder="Password" />
        </n-form-item-->
        <n-space vertical>
          <!--n-button strong secondary type="primary" v-on:click="userStore.signInEmail()">Sign in</n-button-->
          <n-button strong primary color="#B22222" v-on:click="userStore.signInGoogle()">Sign in with Google</n-button>
          <!--n-button v-on:click="userStore.signInGitHub()">Sign in with GitHub</n-button-->
          <!--n-button strong secondary v-on:click="userStore.signUp(email, password)">Sign Up</n-button-->
            <n-alert v-if="errorMessage"
            title="Error" 
            type="error"> {{ errorMessage }} </n-alert>
        </n-space>
      </n-form>
    </n-card>
  </n-modal>
</template>

<script setup>
  import { ref } from 'vue'
  import { useUserStore } from '@/script/stores/userStore'

  const password = ref("")
  const email = ref("")
  const errorMessage = ref("")
  const show = ref(true)

  const userStore = useUserStore()

  function diplayError(error) {
    switch(error.code) {
      case 'auth/email-already-in-use':
        errorMessage.value =  'Email is already in use!'
        break;

      case 'auth/invalid-email':
        errorMessage.value = 'Email is not valid'
        break;

      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage.value = 'Email or Password is incorrect'
        break;

      default:
        console.log('uncaught error code ' + error)
        errorMessage.value = 'An unexpected error has occured, please try again.'
    }
  }

</script>

<style scoped>
.n-card {
  max-width: 400px;
}
.n-button {
  width: stretch;
}
</style>

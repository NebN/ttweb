<template>
  <n-modal :on-after-leave="onClose" >
    <n-card title="Sign In">
      <n-form 
      ref="formRef">
        <n-form-item label="Email">
          <n-input type="text" v-model="email" placeholder="Email" />
        </n-form-item>
        <n-form-item label="Password">
          <n-input type="password" v-model="password" placeholder="Password" />
        </n-form-item>
        <n-space vertical>
          <n-button strong secondary type="primary" v-on:click="loginEmail">Login</n-button>
          <n-button strong primary color="#B22222" v-on:click="loginGoogle">Login with Google</n-button>
        <!--n-button v-on:click="loginGitHub()">Login with GitHub</n-button-->
          <n-button strong secondary v-on:click="signUp">Sign Up</n-button>
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
  import { auth } from '@/main.js'
  import {
  signInWithEmailAndPassword, 
  getRedirectResult, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithRedirect, 
  createUserWithEmailAndPassword} from 'firebase/auth'

  const emit = defineEmits(
    ['login-started', 'login-complete']
  )

  const password = ref("")
  const email = ref("")
  const errorMessage = ref("")
  const show = ref(true)

  const bodyStyle = ref({
    width: "400px"
  })

  function login(callback) {
    emit('login-started')
    callback().then(() =>{
      emit('login-complete')
    })
  }

  function loginEmail() {
    login(mail)
  }

  function loginGoogle() {
    login(google)
  }

  function loginGitHub() {
    login(gitHub)
  }

  async function mail() {
    errorMessage.value = null
    signInWithEmailAndPassword(auth, email.value, password.value)
      .then((userCredential) => {

      }).catch((error) => {
        console.log('error on login ' + error)
        diplayError(error)
      });
  }

  async function google() {
    thirdParty(new GoogleAuthProvider())
  }

  async function gitHub() {
    thirdParty(new GithubAuthProvider())
  }

  async function thirdParty(provider) {
    errorMessage.value = null
    await signInWithRedirect(auth, provider)
    getRedirectResult(auth).then((result) => {
      // OK
    }).catch((error) => {
        console.log('error on getRedirectResult ' + error)
        diplayError(error)
    })
  }

  function signUp() {
    errorMessage.value = null
    createUserWithEmailAndPassword(auth, email.value, password.value)
      .then((userCredential) => {
        // OK
      }).catch((error) => {
        console.log('error on signUp ' + error)
        diplayError(error)
      });
  }

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

  function onClose() {
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

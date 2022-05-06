<template>
  <div id="login" v-if="expand">
    <div id="login-form" >
      <input type="text" v-model="email" placeholder="Email" />
      <input type="password" v-model="password" placeholder="Password" />
      <n-button type="primary" v-on:click="login">Login</n-button>
      <n-button type="primary" v-on:click="loginGoogle">Login with Google</n-button>
      <!--n-button v-on:click="loginGitHub()">Login with GitHub</n-button-->
      <n-button type="primary" v-on:click="signUp">Sign Up</n-button>
    </div>
    <div v-if="errorMessage"> {{ errorMessage }} </div>
  </div>
  <n-button v-else id="prompt" type="primary" @click="clickedSignIn"> Sign in to save your transformations! </n-button>
</template>

<script setup>
  import { NButton } from 'naive-ui'
  import { defineComponent } from 'vue'
  import { ref } from 'vue'
  import { getAuth, 
  signInWithEmailAndPassword, 
  getRedirectResult, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithRedirect, 
  createUserWithEmailAndPassword} from 'firebase/auth'

  defineComponent({
    components: {
      NButton
    }
  })

  const expand = ref(false)

  const password = ref("")
  const email = ref("")
  const loggedIn = ref(false)
  const errorMessage = ref("")

  function clickedSignIn() {
    expand.value = true
  }

  function login() {
    errorMessage.value = null
    const auth = getAuth()
    signInWithEmailAndPassword(auth, email.value, password.value)
      .then((userCredential) => {

      }).catch((error) => {
        console.log('error on login ' + error)
        diplayError(error)
      });
  }

  function loginGoogle() {
    login3rdParty(new GoogleAuthProvider());
  }

  function loginGitHub() {
    login3rdParty(new GithubAuthProvider())
  }

  async function login3rdParty(provider) {
    errorMessage.value = null
    const auth = getAuth()
    await signInWithRedirect(auth, provider)
    getRedirectResult(auth).then((result) => {
    }).catch((error) => {
        console.log('error on getRedirectResult ' + error)
        diplayError(error)
    })
  }

  function signUp() {
    errorMessage.value = null
    const auth = getAuth()
    createUserWithEmailAndPassword(auth, email.value, password.value)
      .then((userCredential) => {
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

</script>

<style scoped>

</style>

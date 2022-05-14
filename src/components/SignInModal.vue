<template>
  <n-modal >
    <n-card title="Sign In" @close="onClose">
      <n-form 
      ref="formRef">
        <n-form-item label="Email">
          <n-input type="text" v-model="email" placeholder="Email" />
        </n-form-item>
        <n-form-item label="Password">
          <n-input type="password" v-model="password" placeholder="Password" />
        </n-form-item>
        <n-space vertical>
          <n-button strong secondary type="primary" v-on:click="login">Login</n-button>
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

  const password = ref("")
  const email = ref("")
  const errorMessage = ref("")
  const show = ref(true)

  const bodyStyle = ref({
    width: "400px"
  })

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

  function onClose() {
    show.value = false
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

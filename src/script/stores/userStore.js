import { defineStore } from "pinia"
import { signOut, 
  getAuth, 
  signInWithEmailAndPassword, 
  getRedirectResult, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithRedirect, 
  createUserWithEmailAndPassword } from "firebase/auth"
import { db } from "@/main.js"
import { getDocs, collection } from "firebase/firestore"
import { useTStore } from "./transformationStore"


export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: null,
      loading: false,
      showSignIn: false,
      showSettings: false
    }
  },

  persist: true,

  getters: {
    isLoggedIn: (state) => {
      return Boolean(state.user)
    },
    userName() {
      return this.isLoggedIn ? this.user.displayName : ''
    },
    avatar() {
      return this.isLoggedIn ? this.user.photoURL : ''
    }
  },

  actions: {
    async setUser(user) {
      this.user = user
      const tStore = useTStore()
      await tStore.setUserTabs(user)
      this.loading = false
    },
    signOut() {
      signOut(getAuth()).then(() => {
      }).catch((error) => {
        console.log('error on sign out ' + error)
      });
    },
    signInGoogle() {
      this.showSignIn = false
      this.loading = true
      this.signInThirdParty(new GoogleAuthProvider())
    },
    signInGitHub() {
      this.showSignIn = false
      this.loading = true
      this.signInThirdParty(new GithubAuthProvider())
    },
    async signInThirdParty(provider) {
      this.showSignIn = false
      this.loading = true
      const auth = getAuth()
      await signInWithRedirect(auth, provider)
      getRedirectResult(auth).then((result) => {
        // OK
      }).catch((error) => {
          console.log('error on getRedirectResult ' + error)
      })
    },
    async signInEmail(email, password) {
      this.showSignIn = false
      this.loading = true
      signInWithEmailAndPassword(getAuth(), email, password)
      .then((userCredential) => {
  
      }).catch((error) => {
        console.log('error on login ' + error)
        diplayError(error)
      });
    },
    async signUp(email, password) {
      createUserWithEmailAndPassword(getAuth(), email, password)
      .then((userCredential) => {
        // OK
      }).catch((error) => {
        console.log('error on signUp ' + error)
        diplayError(error)
      });
    }
  }
})
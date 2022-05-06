import { createApp } from 'vue'
import App from './App.vue'
import { initializeApp } from 'firebase/app'
import { getFirestore } from "firebase/firestore"
import naive from "naive-ui";

// General Font
import 'vfonts/Lato.css'
// Monospace Font
import 'vfonts/FiraCode.css'

const firebaseConfig = {
    apiKey: "AIzaSyAyIN83prtKvTaBLYasP3_-BWfDbamCFiw",
    authDomain: "ttweb-396d0.firebaseapp.com",
    projectId: "ttweb-396d0",
    storageBucket: "ttweb-396d0.appspot.com",
    messagingSenderId: "1032284934610",
    appId: "1:1032284934610:web:a2f39a117ccb59039b380b",
    measurementId: "G-ZMKC4HMYH1"
}

const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore()

export { db }

const app = createApp(App)
app.use(naive)

app.directive('focus', {
    // When the bound element is mounted into the DOM
    mounted(el) {
        // Focus the element
        el.focus()
    }
})

app.mount('#app')

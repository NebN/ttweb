<template>
    <div id="transformations">
      <div >
        <p>Just kidding, coming soon though.</p>
        <p>Thanks for registering.</p>
      </div>
      <SavedTransformation 
      v-for="t in savedTransformations" 
      :key="t.name" 
      :name="t.name"
      />
    </div>
</template>

<script >
  import { ref, onMounted } from "vue"
  import { doc, collection, getDoc, setDoc } from "firebase/firestore"
  import { db } from "@/main.js"
  import SavedTransformation from "./SavedTransformation"

  export default {
    name: "TransformationsBox", 

    components: {
      SavedTransformation
    },

    props: {
      user: null
    },

    setup(props) {

      onMounted(() => {
        setupUser(props.user)
      })

      const savedTransformations = ref([])

      async function setupUser(user) {
        if (user) {
          const userRef = doc(collection(db, 'users'), user.uid)
          const userDoc = await getDoc(userRef)
          if (userDoc && userDoc.data()) {
            savedTransformations.value = userDoc.data()['transformations']
          } else {
            await setDoc(userRef, { transformations: [] })
          }
        } else {
          savedTransformations.value = []
        }
      }

      return {
        setupUser,
        savedTransformations
      }
    }

  }
</script >

<style scoped>

SavedTransformation {
  width: stretch;
}

</style>

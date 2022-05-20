import { defineStore } from "pinia"
import { db } from "@/main.js"
import { getDocs, collection, setDoc, deleteDoc, doc } from "firebase/firestore"
import { useMessage } from 'naive-ui'
import { TTab, LineOfCodeModel } from "@/script/model"
import { useUserStore } from "@/script/stores/userStore"
import { renderMessage } from "@/script/utils"

export const useTStore = defineStore('transformations', {
  state: () => {

    const t = new TTab({
      selected: true
    })

    return {
      tMap: new Map([[t.id, t]]),
      selectedId: t.id,
      showEdit: false,
      showAdd: false,
      showDelete: false
    }
  },

  persist: {
    serializer: {
      serialize: (state) => {
        const tMapArray = Array.from(state.tMap.entries())
        return JSON.stringify({
          tMap: tMapArray,
          selectedId: state.selectedId
        })
      },
      deserialize: (string) => {
        const parsed = JSON.parse(string)
        const tMap = new Map(parsed.tMap.map(kv => {
          return [kv[0], TTab.fromObject(kv[1])]
        }))
        return {
          tMap: tMap,
          selectedId: parsed.selectedId
        }
      }
    }
  },
  getters: {
    tabs: (state) => {
      return Array.from(state.tMap.values())
    },
    selectedTab: (state) => {
      return state.tMap.get(state.selectedId) 
    },
    transformation() {
      return this.selectedTab.transformation()
    }
  },

  actions: {
    updateLines(lines) {
      this.selectedTab.lines = lines
    },
    async setUserTabs(user) {
      const tabs = []

      if (user) {
        const ts = await getDocs(collection(db, 'users', user.uid, 'transformations'))
        ts.forEach(t => {
          const data = t.data()
          tabs.push(new TTab({
            id:  t.id,
            name: data.name,
            lines: data.lines.map(l => new LineOfCodeModel(l))
          }))
        })
      }

      if (tabs.length > 0) {
        const currentTabsToKeep = this.tabs.filter(t => !t.isDefault())
        const merged = currentTabsToKeep.concat(tabs)
        this.$patch({
          tMap: new Map(merged.map(t => [t.id, t])),
        })
        this.selectTab(merged[0])
      } else {
        this.$reset()
        this.selectTab(this.selectedTab)
      }

    },
    newTab(name) {
      this.addTab(new TTab({
        name: name,
        selected: true
      }))
    },
    addTab(t) {
      this.tMap.set(t.id, t)
      this.selectTab(t)
    },
    selectTab(t) {
      if (this.selectedTab) {
        this.selectedTab.selected = false
      }
      this.tMap.get(t.id).selected = true
      this.selectedId = t.id
    },
    async save(callback) {
      const userStore = useUserStore()
      if (userStore.isLoggedIn) {
        const selected = this.selectedTab
        const tDoc = doc(db, 'users', userStore.user.uid, 'transformations',selected.id)
        await setDoc(tDoc, {
          name: selected.name,
          lines: selected.lines.map(l => l._code)
        }).then(() => {
          selected.saved()
          if (callback) {
            callback()
          }
        })
      } else {
        userStore.showSignIn = true
      }
    },
    async delete() {
      const userStore = useUserStore()

      if (this.tMap.size == 1) {
        console.log('cannot remove last element')
      } else {
        const tId = this.selectedId
        this.tMap.delete(tId)
        this.selectTab(this.tMap.values().next().value)
        if (userStore.isLoggedIn) {
          const tDoc = doc(db, 'users', userStore.user.uid, 'transformations', tId)
          await deleteDoc(tDoc).then(() => {
          })
        }
      }
    },
    async edit() {
      const selectedTab = this.selectedTab
      const userStore = useUserStore()
      const tDoc = doc(db, 'users', userStore.user.uid, 'transformations', selectedTab.id)
      await updateDoc(tDoc, {
        name: selectedTab.name
      })
    }
  }
})
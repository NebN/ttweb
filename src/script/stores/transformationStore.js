import { defineStore } from "pinia"
import { db } from "@/main.js"
import { getDocs, collection, setDoc, deleteDoc, updateDoc, doc, writeBatch } from "firebase/firestore"
import { TTab, LineOfCodeModel } from "@/script/model"
import { useUserStore } from "@/script/stores/userStore"

export const useTStore = defineStore('transformations', {
  state: () => {

    const t = new TTab({
      selected: true
    })

    const modes = [
      {
        value: 'auto',
        label: 'Auto Exec',
        description: 'Automatically execute transformations whenever code or input changes'
      },
      {
        value: 'manual',
        label: 'Manual Exec',
        description: 'Manually execute transformations with the play button'
      },
      {
        value: 'file',
        label: 'File Only',
        description: 'Only execute transformations on uploaded files. Will not display any text.'
      }
    ]

    return {
      tMap: new Map([[t.id, t]]),
      selectedId: t.id,
      showEdit: false,
      showAdd: false,
      showDelete: false,
      modes: modes,
      selectedMode: 'auto'
    }
  },

  persist: {
    serializer: {
      serialize: (state) => {
        const tMapArray = Array.from(state.tMap.entries())
        return JSON.stringify({
          tMap: tMapArray,
          selectedId: state.selectedId,
          selectedMode: state.selectedMode
        })
      },
      deserialize: (string) => {
        const parsed = JSON.parse(string)
        const tMap = new Map(parsed.tMap.map(kv => {
          return [kv[0], TTab.fromObject(kv[1])]
        }))
        return {
          tMap: tMap,
          selectedId: parsed.selectedId,
          selectedMode: parsed.selectedMode
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
      let currentTabsToKeep = []

      if (user) {
        currentTabsToKeep = this.tabs.filter(t => !t.isDefault())
        const ts = await getDocs(collection(db, 'users', user.uid, 'transformations'))
        ts.forEach(t => {
          const data = t.data()
          tabs.push(new TTab({
            id:  t.id,
            name: data.name,
            lines: data.lines.map(l => new LineOfCodeModel(l))
          }))
        })

        if (currentTabsToKeep.length > 0) {
          const batch = writeBatch(db)
          currentTabsToKeep.forEach(t => {
            batch.set(doc(db, 'users', user.uid, 'transformations', t.id), {
              name: t.name,
              lines: t.lines.map(l => l.getCode())
            })
          })
          await batch.commit()
        }
      }
      
      const merged = currentTabsToKeep.concat(tabs)

      if (merged.length > 0) {
        this.$patch({
          tMap: new Map(merged.map(t => [t.id, t])),
          selectedId: merged[0].id
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
        const selectedTab = this.selectedTab
        const tDoc = doc(db, 'users', userStore.user.uid, 'transformations',selectedTab.id)
        await setDoc(tDoc, {
          name: selectedTab.name,
          lines: selectedTab.lines.map(l => l._code)
        }).then(() => {
          selectedTab.saved()
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
      if (userStore.isLoggedIn) {
        const tDoc = doc(db, 'users', userStore.user.uid, 'transformations', selectedTab.id)
        await updateDoc(tDoc, {
          name: selectedTab.name
        })
      }
    }
  }
})
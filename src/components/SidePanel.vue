  <template>
    <n-space id="panel" vertical>
      <n-space justify="space-evenly" size="small">
      <n-button @click.stop="tStore.showDelete = true">
        <template #icon>
          <Delete16Filled />  
        </template>
      </n-button>
      <n-button @click.stop="onEdit">
        <template #icon>
          <Edit16Filled />  
        </template>
      </n-button>
      <n-button @click.stop="onSave" >
        <template #icon depth="5">
          <n-icon :component="Save16Filled" /> 
        </template>
      </n-button>
      <!--n-button secondary type="primary" @click.stop="onPlay">
        <template #icon>
          <Play16Filled />  
        </template>
      </n-button-->
      <n-button @click="showDrawer=true">
        <template #icon>
          <Question20Filled />  
        </template>
      </n-button>
      </n-space>
    <Drawer v-model:show="showDrawer" />
      <n-spin :show="loading">
        <TransformationsBox />
      </n-spin>
    </n-space>
</template>


<script setup>
  import { ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useMessage } from 'naive-ui'
  import { useUserStore } from '@/script/stores/userStore.js'
  import { useTStore } from '@/script/stores/transformationStore.js'
  import { renderMessage } from '@/script/utils'
  import Drawer from './Drawer.vue'
  import TransformationsBox from './TransformationsBox.vue'
  import { Question20Filled, Edit16Filled, Play16Filled, Delete16Filled, Save16Filled } from '@vicons/fluent'
  import { RecordStop20Regular } from '@vicons/fluent'

  const userStore = useUserStore()
  const tStore = useTStore()
  const { loading } = storeToRefs(userStore)
  const showDrawer = ref(false)

  const message = useMessage()

  function onEdit() {
    tStore.showEdit = true
  }

  function onSave() {
    const callback = () => {
      message.success('Saved ' + tStore.selectedTab.name + '!', {
        render: renderMessage,
        duration: 2500,
        closable: true
      })
    }
    tStore.save(callback)
  }

  function onDelete() {
    tStore.delete()
  }

</script>

<style scoped>
</style>

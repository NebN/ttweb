  <template>
    <n-space id="panel" vertical size="large">
      <div ref="notBox">
        <n-radio-group v-model:value="tStore.selectedMode" size="small" >
          <n-radio-button
          v-for="mode in tStore.modes"
          :key="mode.value"
          :value="mode.value"
          :label="mode.label"
          />
        </n-radio-group>
        <n-space justify="space-evenly" size="small">
          <n-tooltip :delay="300">
            <template #trigger>
              <n-button @click.stop="tStore.showDelete = true">
                <template #icon><Delete16Filled /></template>
              </n-button>
            </template>
          Delete transformation
        </n-tooltip>
        <n-tooltip :delay="300">
          <template #trigger>
            <n-button @click.stop="onEdit">
              <template #icon><Edit16Filled /></template>
            </n-button>
          </template>
          Edit transformation name
        </n-tooltip>
        <n-tooltip :delay="300">
          <template #trigger>
            <n-button @click.stop="onSave" >
            
              <template #icon ><n-icon :depth="tStore.selectedTab.isDirty() ? 1 : 5" :component="Save16Filled" /></template>
            </n-button>
          </template>
          Save transformation
        </n-tooltip>
        <n-tooltip v-if="tStore.selectedMode=='manual'" :delay="300">
          <template #trigger>
            <n-button secondary type="primary" @click.stop="onPlay">
              <template #icon><Play16Filled/></template>
            </n-button>
          </template>
          Execute transformation
        </n-tooltip>
        <n-tooltip :delay="300">
          <template #trigger>
            <n-button @click="showDrawer=true">
              <template #icon><Question20Filled/></template>
            </n-button>
          </template>
          Help
        </n-tooltip>
      </n-space>
     <Drawer v-model:show="showDrawer" />
    </div>
      <n-spin :show="loading">
        <TransformationsBox :height=boxHeight />
      </n-spin>
    </n-space>
</template>


<script setup>
  import { ref, computed, toRef } from 'vue'
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

  const notBox = ref(null)

  const emit = defineEmits(
    ['play']
  )

  const props = defineProps({
    sidePanelHeight: 0
  })
  
  const boxHeight = computed(() => {
    const notBoxHeight = notBox.value != null ? notBox.value.offsetHeight : 0
    return props.sidePanelHeight - notBoxHeight
  })

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

  function onPlay() {
    emit('play')
  }

</script>

<style scoped>
.n-radio-group {
  padding: 10px;
  display: flex;
}
.n-radio-button {
  margin-left: auto;
  margin-right: auto;
}
</style>

  <template>
  <div id="panel">
    <n-space justify="space-around" size="small">
        <n-button @click="showDrawer=true">
          <template #icon>
            <Question20Filled />  
          </template>
        </n-button>
        <!--n-switch v-model:value="active" size="medium">
          <template #icon>
            🤔
          </template>
        </n-switch-->
    </n-space>
    <Drawer v-model:show="showDrawer" />
    <div>
      <n-divider title-placement="left">
      Saved Transformations
      </n-divider>
      <TransformationsBox 
      @selected="onSelected" 
      @save="onSave"
      @delete="onDelete"
      @edit="onEdit"
      @add="onAdd"
      :savedTransformationChains="savedTransformationChains"
      v-if="loggedIn"/>
      <div class="signInPrompt" v-else><a href="#" @click.prevent="emit('sign-in')">Sign In</a> to save your transformations!</div>
    </div>
  </div>
</template>


<script setup>
  import { ref } from 'vue'
  import Drawer from './Drawer.vue'
  import TransformationsBox from './TransformationsBox.vue'
  import { Question20Filled } from '@vicons/fluent'
  import { RecordStop20Regular } from '@vicons/fluent'

  const props = defineProps({
    loggedIn: null,
    savedTransformationChains: {
      type: Array,
      default: []
    }
  })

  const showDrawer = ref(false)
  const active = ref(true)

  const emit = defineEmits(['sign-in', 'selected', 'save', 'delete', 'edit', 'add'])

  function onSelected(t) {
    emit('selected', t)
  }

  function onSave(t) {
    emit('save', t)
  }

  function onDelete(t) {
    emit('delete', t)
  }

  function onEdit(t, newName) {
    emit('edit', t, newName)
  }

  function onAdd(t) {
    emit('add', t)
  }

</script>

<style scoped>
.signInPrompt {
  text-align: center;
}
</style>

<template>
  <n-drawer :show="active" :width="400" placement="left">
    <n-drawer-content title="Cheat Sheet" closable>
        <n-space vertical>
          <n-collapse >
            <n-collapse-item title='Execution modes' name='1'>
              <n-collapse>
                <n-collapse-item v-for="mode in tStore.modes" :title="mode.label" :name="mode.value" :key="mode.value">
                  <div>{{mode.description}}</div>
                </n-collapse-item>    
              </n-collapse>
            </n-collapse-item>
            <n-collapse-item title='Transformations' name='2'>
              <n-collapse>
                <n-collapse-item title='grep' name='1'>
                  <div>grep "text"</div>
                </n-collapse-item>
                <n-collapse-item title='sort' name='2'>
                  <div>sort</div>
                </n-collapse-item>
                <n-collapse-item title='replace' name='3'>
                  <p>replace "regex" with "replacement"</p>
                </n-collapse-item>
                <n-collapse-item title='distinct' name='4'>
                  <div>distinct</div>
                </n-collapse-item>
                <n-collapse-item title='strip' name='5'>
                  <div> strip</div>
                </n-collapse-item>
              </n-collapse>
            </n-collapse-item>
          </n-collapse>
        </n-space>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
  import { useTStore } from '@/script/stores/transformationStore.js'

  const tStore = useTStore()
  
  defineProps({
    active: false
  })

</script>
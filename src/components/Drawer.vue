<template>
  <n-drawer :show="active" :width="400" placement="left">
    <n-drawer-content title="Info" closable>
        <n-space vertical>
          <n-collapse id='box' >
            <n-collapse-item title='replace' name='1'>
              <p>replace "regex" with "replacement"</p>
            </n-collapse-item>

            <n-collapse-item title='grep' name='2'>
              <div>grep "text"</div>
            </n-collapse-item>

            <n-collapse-item title='sort' name='3'>
              <div>sort</div>
            </n-collapse-item>

            <n-collapse-item title='distinct' name='4'>
              <div>distinct</div>
            </n-collapse-item>

            <n-collapse-item title='strip' name='5'>
              <div> strip</div>
            </n-collapse-item>
          </n-collapse>
        </n-space>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
  defineProps({
    active: false
  })

</script>
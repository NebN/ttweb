<template>
    <n-collapse id='box' accordion>
        
        <n-collapse-item title='replace' name='1'>
          <div>replace "regex" with "replacement"</div>
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
          <div>strip</div>
        </n-collapse-item>

    </n-collapse>
</template>

<script setup>

  import { NCollapse, NCollapseItem } from 'naive-ui'
  import { defineComponent } from 'vue';

  defineComponent({
    components: {
      NCollapse,
      NCollapseItem
    }
  })

</script>

<style scoped>

#box {
  padding: 8px;
}
</style>
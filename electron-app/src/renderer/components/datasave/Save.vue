<template>

  <el-row :gutter="20" class="user-management">
    <!-- 输入框和按钮并列 -->
    <el-col :span="24" class="input-and-buttons">
      <div class="input-and-button">
        <el-input v-model="input" style="width: 280px; margin-left: 20px;" placeholder="请选择备份路径" />
        <el-button type="primary" @click="handleClick">一键备份</el-button>
      </div>
    </el-col>
  </el-row>

  <div class="demo-progress">
    <el-progress :percentage="50" :stroke-width="15" striped />
    <el-progress :percentage="30" :stroke-width="15" status="warning" striped striped-flow />
    <el-progress :percentage="100" :stroke-width="15" status="success" striped striped-flow :duration="10" />
    <el-progress :percentage="percentage" :stroke-width="15" status="exception" striped striped-flow
      :duration="duration" />
    <el-button-group>
      <el-button :icon="Minus" @click="decrease" />
      <el-button :icon="Plus" @click="increase" />
    </el-button-group>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { Minus, Plus } from '@element-plus/icons-vue'

const percentage = ref<number>(70)
const duration = computed(() => Math.floor(percentage.value / 10))

const increase = () => {
  percentage.value += 10
  if (percentage.value > 100) {
    percentage.value = 100
  }
}
const decrease = () => {
  percentage.value -= 10
  if (percentage.value < 0) {
    percentage.value = 0
  }
}
const input = ref('')

const handleClick = () => {
    console.log('click')
  }

</script>

<style scoped>
.demo-progress .el-progress--line {
  margin-bottom: 15px;
  max-width: 600px;
}
.input-and-button {
    display: flex;
    justify-content: space-between;
    /* 左右对齐 */
    align-items: center;
    /* 垂直居中 */
    margin-bottom: 20px;
}

</style>
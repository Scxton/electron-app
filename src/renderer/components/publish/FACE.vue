<template>
  <div class="publish-process">
    <!-- 步骤指示 -->
    <div class="progress-bar">
      <div v-for="(step, index) in steps" :key="index" :class="['step', { completed: currentStep > index }]">
        {{ step }}
      </div>
    </div>

    <!-- 当前步骤内容 -->
    <div class="step-content">
      <component :is="currentComponent" @next="nextStep" @prev="prevStep" />
    </div>

    <!-- 操作按钮 -->
    <div class="button-group">
      <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
      <el-button v-if="currentStep < steps.length - 1" @click="nextStep">下一步</el-button>
      <el-button v-if="currentStep === steps.length - 1" @click="submit">提交</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AchInfo from './Ach_info.vue';
import Upload from './Upload.vue';
import TemplateChoice from './Template_choice.vue';
import QualityCheck from './QualityCheck.vue';

const currentStep = ref(0);
const steps = ['填写成果信息', '上传文件', '选择模板', '质量检查'];
const components = [AchInfo, Upload, TemplateChoice, QualityCheck];
const currentComponent = ref(components[currentStep.value]);

const nextStep = () => {
  // 保存当前步骤的数据，通常是发送给后端
  saveData(currentStep.value);
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
    currentComponent.value = components[currentStep.value];
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    currentComponent.value = components[currentStep.value];
  }
};

const saveData = (step) => {
  // 这里只是模拟保存步骤数据
  console.log(`保存步骤 ${step} 的数据`);
};

const submit = () => {
  // 提交数据到后端
  console.log('提交完成，数据已经发送到后端');
};
</script>

<style scoped>
.publish-process {
  max-width: 2200px;
  margin: 0 auto;
  padding: 20px;
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.step {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  text-align: center;
  width: 30%;
}

.step.completed {
  background-color: #4caf50;
  color: white;
}

.step-content {
  margin-bottom: 20px;
}

.button-group {
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>

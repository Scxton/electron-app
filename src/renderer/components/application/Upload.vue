<template>
  <div>
    <h1>文件上传</h1>
    <!-- 显示当前步骤 -->
    <p>当前步骤：Step {{ currentStep }}</p>

    <Step1 v-if="currentStep === 1" 
           :basicInfo="basicInfo" 
           @nextStep="goToNextStep" 
           @save="saveBasicInfo" />

    <Step2 v-if="currentStep === 2" 
           :file="file" 
           @nextStep="goToNextStep" 
           @prevStep="goToPrevStep" 
           @save="saveFile" />

    <Step3 v-if="currentStep === 3" 
           :basicInfo="basicInfo" 
           :file="file" 
           @prevStep="goToPrevStep" 
           @finish="finishUpload" />
  </div>
</template>

<script>
import Step1 from './Step1.vue';
import Step2 from './Step2.vue';
import Step3 from './Step3.vue';

export default {
  components: {
    Step1,
    Step2,
    Step3
  },
  data() {
    return {
      currentStep: 1,
      basicInfo: {
        time: '',
        type: ''
      },
      file: null
    };
  },
  methods: {
    goToNextStep() {
      this.currentStep++;
    },
    goToPrevStep() {
      this.currentStep--;
    },
    saveBasicInfo(info) {
      this.basicInfo = info;
    },
    saveFile(file) {
      this.file = file;
    },
    finishUpload() {
      alert('上传完成');
    }
  }
};
</script>

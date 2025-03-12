<template>
    <div class="publish-container">
        <el-steps :active="currentStep" finish-status="success">
            <el-step title="填写成果信息" />
            <el-step title="上传文件" />
            <el-step title="选择模板" />
            <el-step title="确认发布" />
        </el-steps>

        <div class="publish-content">
            <BasicInfoForm v-if="currentStep === 0" />
            <FileUploadForm v-else-if="currentStep === 1" />
            <TemplateSelectForm v-else-if="currentStep === 2" />
            <PublishConfirmForm v-else-if="currentStep === 3" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import BasicInfoForm from './BasicInfoForm.vue'
import FileUploadForm from './FileUploadForm.vue'

const currentStep = ref(0)
</script>

<style lang="css" scoped>
.publish-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
}

.publish-content {
    margin-top: 30px;
}
</style>s
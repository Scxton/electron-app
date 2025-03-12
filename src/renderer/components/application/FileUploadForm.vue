<template>
    <div class="file-upload-form">
        <el-upload
            class="upload-demo"
            drag
            multiple
            action="#"
            :limit="5"
            :on-exceed="handleExceed"
        >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
                将文件拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
                <div class="el-upload__tip">
                    支持上传 PDF、DOC、DOCX 格式文件，单个文件大小不超过 50MB
                </div>
            </template>
        </el-upload>
    </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const handleExceed = () => {
    ElMessage.warning('最多只能上传5个文件')
}
</script>

<style lang="css" scoped>
.file-upload-form {
    display: flex;
    justify-content: center;
    padding: 20px;
}
</style>
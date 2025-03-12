<template>
    <div class="basic-info-form">
        <el-form :model="formData" label-width="120px">
            <el-form-item label="成果名称">
                <el-input v-model="formData.title" placeholder="请输入成果名称" />
            </el-form-item>

            <el-form-item label="成果类型">
                <el-select v-model="formData.type" placeholder="请选择成果类型">
                    <el-option label="学术论文" value="paper" />
                    <el-option label="专利" value="patent" />
                    <el-option label="科研项目" value="project" />
                </el-select>
            </el-form-item>

            <el-form-item label="发布日期">
                <el-date-picker 
                    v-model="formData.publishDate" 
                    type="date" 
                    placeholder="选择发布日期" 
                />
            </el-form-item>

            <el-form-item label="作者信息">
                <div v-for="(author, index) in formData.authors" :key="index" class="author-item">
                    <el-input v-model="author.name" placeholder="作者姓名" style="width: 45%; margin-right: 10px;" />
                    <el-input v-model="author.organization" placeholder="所属单位" style="width: 45%;" />
                    <el-button 
                        v-if="formData.authors.length > 1" 
                        type="danger" 
                        icon="Delete" 
                        circle 
                        @click="removeAuthor(index)"
                    />
                </div>
                <el-button type="primary" plain @click="addAuthor">添加作者</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
    title: '',
    type: '',
    publishDate: '',
    authors: [{ name: '', organization: '' }]
})

const addAuthor = () => {
    formData.value.authors.push({ name: '', organization: '' })
}

const removeAuthor = (index) => {
    if (formData.value.authors.length > 1) {
        formData.value.authors.splice(index, 1)
    }
}
</script>

<style lang="css" scoped>
.author-item {
    display: flex;
    margin-bottom: 10px;
    align-items: center;
}
</style>
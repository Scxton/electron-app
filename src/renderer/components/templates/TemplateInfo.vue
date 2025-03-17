<template>
    <div class="template-container">
        <div class="header">
            <h2>模板管理</h2>
            <div class="search-box">
                <input type="text" placeholder="请输入关键字搜索" v-model="searchQuery">
                <i class="search-icon">🔍</i>
            </div>
        </div>

        <div v-if="loading">加载中...</div>
        <div v-else-if="error">{{ error }}</div>
        <div v-else class="template-table">
            <table>
                <thead>
                    <tr>
                        <th>模板名称</th>
                        <th>上传时间</th>
                        <th>更新时间</th>
                        <th>上传用户</th>
                        <th>版本号</th>
                        <th>模板简介</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="template in templates" :key="template.id">
                        <td>{{ template.templateName }}</td>
                        <td>{{ template.uploadTime }}</td>
                        <td>{{ template.updateTime }}</td>
                        <td class="user-cell">
                            
                            <span>{{ template.userId }}</span>
                        </td>
                        <td>{{ template.versionNumber || '-' }}</td>
                        <td>{{ template.templateIntro || '-' }}</td>
                        <td class="actions">
                            <button class="btn download-btn" @click="downloadTemplate(template)">下载</button>
                            <button class="btn edit-btn" @click="editTemplate(template)">编辑</button>
                            <button class="btn delete-btn" @click="deleteTemplate(template)">删除</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="upload-section">
            <button class="upload-btn" @click="handleUpload">模板上传</button>
        </div>

        <!-- 添加编辑对话框 -->
        <el-dialog
            v-model="editDialogVisible"
            title="编辑模板"
            width="50%"
            :before-close="() => editDialogVisible = false"
        >
            <el-form :model="currentTemplate" label-width="120px">
                <el-form-item label="模板名称">
                    <el-input v-model="currentTemplate.templateName"></el-input>
                </el-form-item>
                <el-form-item label="模板类型">
                    <el-input v-model="currentTemplate.templateType"></el-input>
                </el-form-item>
                <el-form-item label="模板简介">
                    <el-input 
                        v-model="currentTemplate.templateIntro" 
                        type="textarea" 
                        :rows="4"
                    ></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input 
                        v-model="currentTemplate.remarks" 
                        type="textarea" 
                        :rows="2"
                    ></el-input>
                </el-form-item>
                <el-form-item label="版本号">
                    <el-input v-model="currentTemplate.versionNumber"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveTemplate">保存</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { queryAll, deleteItem, updateTemplate } from '../../api/template'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const templates = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const editDialogVisible = ref(false)
const currentTemplate = ref({})
// const defaultAvatar = 'path/to/default-avatar.png' // 设置默认头像路径

const fetchTemplates = async () => {
    try {
        loading.value = true
        const response = await queryAll()
        templates.value = response
    } catch (err) {
        error.value = '获取模板列表失败: ' + err.message
    } finally {
        loading.value = false
    }
}

const downloadTemplate = (template) => {
    // 实现下载逻辑
}

const editTemplate = (template) => {
    currentTemplate.value = { ...template }
    editDialogVisible.value = true
}

const saveTemplate = async () => {
    try {
        loading.value = true
        
        // Make sure we have the required templateId
        if (!currentTemplate.value.templateId) {
            throw new Error('模板ID不存在')
        }
        
        // Add current timestamp for updateTime
        const updateData = {
            ...currentTemplate.value,
            updateTime: new Date().toISOString()
        }
        
        await updateTemplate(updateData)
        ElMessage.success('模板更新成功')
        editDialogVisible.value = false
        await fetchTemplates()
    } catch (err) {
        error.value = '更新模板失败: ' + err.message
        ElMessage.error('更新失败: ' + err.message)
    } finally {
        loading.value = false
    }
}

const deleteTemplate = async (template) => {
    try {
        await ElMessageBox.confirm('确定要删除该模板吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            customClass: 'custom-message-box'
        })
        await deleteItem(template.templateId)
        ElMessage.success('删除成功')
        await fetchTemplates()
    } catch (err) {
        if (err !== 'cancel') {
            error.value = '删除模板失败: ' + err.message
            ElMessage.error('删除失败')
        }
    }
}

const handleUpload = () => {
    router.push('/home/template')
}

onMounted(() => {
    fetchTemplates()
})
</script>

<style lang="css" scoped>
.template-container {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.search-box {
    position: relative;
    width: 300px;
}

.search-box input {
    width: 100%;
    padding: 8px 30px 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.search-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

.template-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

th {
    background-color: #f8f9fa;
    font-weight: 500;
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
}

.actions {
    display: flex;
    gap: 8px;
}

.btn {
    padding: 6px 14px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.3s ease;
}

.download-btn {
    background-color: #f6ffed;
    color: #52c41a;
}

.edit-btn {
    background-color: #fff7e6;
    color: #fa8c16;
}

.delete-btn {
    background-color: #fff1f0;
    color: #f5222d;
}

.upload-section {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.upload-btn {
    padding: 8px 16px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.upload-btn:hover {
    background-color: #40a9ff;
}

/* 添加自定义确认框样式 */
:global(.custom-message-box) {
    border-radius: 8px;
    padding: 20px;
}

:global(.custom-message-box .el-message-box__header) {
    padding-bottom: 15px;
}

:global(.custom-message-box .el-message-box__content) {
    padding: 20px 0;
}

:global(.custom-message-box .el-message-box__btns) {
    padding-top: 15px;
}

:global(.custom-message-box .el-button) {
    border-radius: 4px;
    padding: 8px 20px;
}

/* 添加编辑对话框样式 */
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>
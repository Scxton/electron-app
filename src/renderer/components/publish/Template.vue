<template>
    <div class="template-container">
        <div class="header">
            <div class="header-left">
                <h2>模板选择</h2>
                <button class="upload-btn" @click="handleUpload">模板上传</button>
            </div>
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
                        <th>版本号</th>
                        <th class="filter-header">
                            模板类型
                            <el-select 
                                v-model="templateTypeFilter" 
                                placeholder="全部"
                                size="small"
                                clearable
                                @change="handleFilterChange"
                            >
                                <el-option label="全部" value=""></el-option>
                                <el-option label="论文" value="paper"></el-option>
                                <el-option label="专利" value="patent"></el-option>
                                <el-option label="其他" value="other"></el-option>
                            </el-select>
                        </th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="template in filteredTemplates" :key="template.id">
                        <td>
                            <a href="#" class="template-name" @click.prevent="showTemplateDetails(template)">
                                {{ template.templateName }}
                            </a>
                        </td>
                        <td>{{ template.uploadTime }}</td>
                        <td>{{ template.updateTime }}</td>
                        <td>{{ template.versionNumber || '-' }}</td>
                        <td>{{ template.templateType || '-' }}</td>
                        <td class="actions">
                            <button class="btn download-btn" @click="downloadTemplate(template)">下载</button>
                        </td>
                    </tr>
                </tbody>
            </table>
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

        <!-- 修改审核对话框 -->
        <el-dialog
            v-model="auditDialogVisible"
            title="模板审核"
            width="30%"
            :before-close="() => auditDialogVisible = false"
        >
            <div class="audit-content">
                <p>请选择审核结果：</p>
                <div class="audit-options">
                    <el-radio-group v-model="auditResult">
                        <el-radio :label="true">通过</el-radio>
                        <el-radio :label="false">不通过</el-radio>
                    </el-radio-group>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="auditDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitAudit">确认</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 添加模板详情对话框 -->
        <el-dialog
            v-model="detailsDialogVisible"
            title="模板详情"
            width="50%"
        >
            <div class="template-details" v-if="selectedTemplate">
                <div class="detail-item">
                    <label>模板名称：</label>
                    <span>{{ selectedTemplate.templateName }}</span>
                </div>
                <div class="detail-item">
                    <label>上传时间：</label>
                    <span>{{ selectedTemplate.uploadTime }}</span>
                </div>
                <div class="detail-item">
                    <label>更新时间：</label>
                    <span>{{ selectedTemplate.updateTime }}</span>
                </div>
                <div class="detail-item">
                    <label>版本号：</label>
                    <span>{{ selectedTemplate.versionNumber || '-' }}</span>
                </div>
                <div class="detail-item">
                    <label>模板类型：</label>
                    <span>{{ selectedTemplate.templateType || '-' }}</span>
                </div>
                <div class="detail-item">
                    <label>模板简介：</label>
                    <span>{{ selectedTemplate.templateIntro || '-' }}</span>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { queryAll, deleteItem, updateTemplate, submitDownload, downloadTemplateFile } from '../../api/template'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { addLog } from '../../api/log'

const router = useRouter()
const templates = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const editDialogVisible = ref(false)
const currentTemplate = ref({})
const auditDialogVisible = ref(false)
const templateToAudit = ref(null)
const reviewStatusFilter = ref('')
const auditResult = ref(true)
const templateTypeFilter = ref('')
const detailsDialogVisible = ref(false)
const selectedTemplate = ref(null)

// 修改模板类型映射
const templateTypeMap = {
    'paper': '论文',
    '论文': '论文',
    'patent': '专利', 
    '专利': '专利',
    'other': '其他',
    '其他': '其他'
}

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

const downloadTemplate = async (template) => {
    try {
        // 假设当前用户ID保存在某个地方，这里需要根据你的实际情况获取
        const userId = localStorage.getItem('userId');; // 替换为实际的用户ID获取方式
        console.log('开始下载模板:', template.templateId, '用户ID:', userId);
        
        // 先提交下载记录
        console.log('提交下载记录...');
        const response = await submitDownload(template.templateId, userId);
        console.log('下载记录响应:', response);
        
        if (response) {
            // 获取文件名并下载文件
            const fileName = response;
            console.log('获取到文件名:', fileName);
            
            // 直接调用下载函数，它会处理文件下载和保存
            await downloadTemplateFile(fileName);
            
            ElMessage.success('下载成功');
        } else {
            throw new Error(response?.message || '下载失败：未获取到文件名');
        }
    } catch (err) {
        console.error('下载过程出错:', err);
        error.value = '下载失败: ' + err.message;
        ElMessage.error('下载失败: ' + err.message);
    }
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
        
        // Add log for template update
        await addLog({
            userId: localStorage.getItem('userId'),
            logIntro: `更新模板: ${currentTemplate.value.templateName}`,
            logTime: new Date().toISOString().split('T')[0],
            tableStatus: true
        })
        
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
        
        // Add log for template deletion
        await addLog({
            userId: template.userId,
            logIntro: `删除模板: ${template.templateName}`,
            logTime: new Date().toISOString().split('T')[0],
            tableStatus: true
        })
        
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

const showAuditDialog = (template) => {
    templateToAudit.value = template
    auditResult.value = true // 重置为默认值
    auditDialogVisible.value = true
}

const submitAudit = async () => {
    try {
        if (!templateToAudit.value) {
            throw new Error('未选择模板')
        }

        const updateData = {
            ...templateToAudit.value,
            reviewStatus: auditResult.value,
            updateTime: new Date().toISOString()
        }

        await updateTemplate(updateData)
        ElMessage.success(auditResult.value ? '审核通过成功' : '审核不通过')
        auditDialogVisible.value = false
        
        // Add log for template audit
        await addLog({
            userId: templateToAudit.value.userId,
            logIntro: `审核模板: ${templateToAudit.value.templateName} (${auditResult.value ? '通过' : '不通过'})`,
            logTime: new Date().toISOString().split('T')[0],
            tableStatus: true
        })
        
        await fetchTemplates()
    } catch (err) {
        error.value = '审核失败: ' + err.message
        ElMessage.error('审核失败: ' + err.message)
    }
}

// 修改 filteredTemplates 计算属性
const filteredTemplates = computed(() => {
    let filtered = templates.value.filter(template => template.reviewStatus === true)
    
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        filtered = filtered.filter(template => 
            template.templateName?.toLowerCase().includes(query) ||
            template.templateId?.toString().toLowerCase().includes(query)
        )
    }
    
    if (templateTypeFilter.value) {
        filtered = filtered.filter(template => {
            const type = template.templateType?.toLowerCase()
            return type === templateTypeFilter.value || 
                   templateTypeMap[type] === templateTypeMap[templateTypeFilter.value]
        })
    }
    
    return filtered.map(template => ({
        ...template,
        templateType: templateTypeMap[template.templateType] || '其他'
    }))
})

const handleFilterChange = () => {
    // 可以在这里添加额外的处理逻辑
    console.log('Filter changed:', reviewStatusFilter.value)
}

const showTemplateDetails = (template) => {
    selectedTemplate.value = template
    detailsDialogVisible.value = true
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

.header-left {
    display: flex;
    align-items: center;
    gap: 16px;  /* 标题和按钮之间的间距 */
}

.header-left h2 {
    margin: 0;  /* 移除标题默认边距 */
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

.audit-btn {
    background-color: #e6f7ff;
    color: #1890ff;
}

.audit-content {
    text-align: center;
    padding: 20px 0;
}

.audit-options {
    margin-top: 20px;
}

.audit-options :deep(.el-radio) {
    margin-right: 30px;
}

.status-tag {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.status-approved {
    background-color: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
}

.status-pending {
    background-color: #fff7e6;
    color: #fa8c16;
    border: 1px solid #ffd591;
}

.filter-header {
    position: relative;
}

.filter-header :deep(.el-select) {
    margin-left: 8px;
    width: 90px;
}

.filter-header :deep(.el-input__wrapper) {
    padding: 0 8px;
}

.filter-header :deep(.el-input__inner) {
    font-size: 12px;
}

.template-name {
    color: #1890ff;
    text-decoration: none;
    cursor: pointer;
}

.template-name:hover {
    text-decoration: underline;
}

.template-details {
    padding: 20px;
}

.detail-item {
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;
}

.detail-item label {
    width: 100px;
    color: #606266;
    font-weight: 500;
}

.detail-item span {
    flex: 1;
}
</style>
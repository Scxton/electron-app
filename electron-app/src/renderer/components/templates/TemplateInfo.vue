<template>
    <div class="template-management">
        <!-- 搜索框 -->
        <div class="header-section">
            <el-input v-model="searchText" placeholder="请输入模板ID或模板名称" style="width: 300px;" clearable
                @input="filterTemplates">
                <template #prefix>
                    <i class="el-icon-search"></i>
                </template>
            </el-input>
        </div>

        <!-- 模板信息表格 -->
        <el-table :data="filteredTemplates" style="width: 100%;" border
            :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
            <el-table-column prop="templateId" label="模板ID" width="150" />
            <el-table-column prop="templateName" label="模板名称" width="200" />
            <el-table-column prop="uploadTime" label="上传时间" width="150" />
            <el-table-column prop="updateTime" label="更新时间" width="150" />
            <el-table-column prop="userId" label="上传用户" width="150" />
            <el-table-column prop="remarks" label="备注" width="150" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button size="small" @click="previewTemplate(scope.row)">预览</el-button>
                    <el-button size="small" type="primary" @click="downloadTemplate(scope.row)">
                        下载
                    </el-button>
                    <el-button size="small" type="danger" @click="deleteTemplate(scope.row)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div style="margin-top: 30px;">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background
                @size-change="handlePageSizeChange" @current-change="handleCurrentChange" :page-sizes="[2, 8, 15]"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>

        <!-- 上传按钮 -->
        <div class="upload-button">
            <el-button type="primary" @click="openUploadDialog">模板上传</el-button>
        </div>

        <!-- 上传对话框 -->
        <el-dialog title="上传模板" :visible.sync="uploadDialogVisible">
            <el-form :model="uploadForm" label-width="100px">
                <!-- 模板类型选择 -->
                <el-form-item label="模板类型">
                    <el-select v-model="uploadForm.templateType" placeholder="请选择模板类型">
                        <el-option label="发明专利模板" value="发明专利模板"></el-option>
                        <el-option label="期刊论文模板" value="期刊论文模板"></el-option>
                        <el-option label="其他成果模板" value="其他成果模板"></el-option>
                    </el-select>
                </el-form-item>

                <!-- 文件上传 -->
                <el-form-item label="上传文件">
                    <el-upload class="upload-demo" drag action="https://jsonplaceholder.typicode.com/posts/"
                        :on-preview="handlePreview" :on-remove="handleRemove" :file-list="fileList" :limit="1"
                        accept=".pdf" :before-upload="beforeUpload">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
                        <div class="el-upload__tip">仅支持 .pdf 文件</div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="uploadDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitUpload">确认上传</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { queryAll, queryAllWithPagination } from "../../api/template"

const filteredTemplates = ref([])   //模板数据列表
const total = ref(0)   //模板总数
const currentPage = ref(1)  // 当前页码
const pageSize = ref(2)  // 每页数量（可通过下拉框选择）

//进入页面后，获取模板总数量，获取第一页数据
onMounted(async () => {
    filteredTemplates.value = await queryAll()   //链接后端请求获取数据
    total.value = filteredTemplates.value.length
    fetchData()
})

// 分页获取数据
const fetchData = async () => {
    try {
        filteredTemplates.value = await queryAllWithPagination(currentPage.value, pageSize.value)
    } catch (error) {
        console.error('Error fetching data: ', error)
    }
}

const handlePageSizeChange = (newSize) => {
    currentPage.value = 1
    pageSize.value = newSize
    fetchData()
}

const handleCurrentChange = (newPage) => {
    currentPage.value = newPage
    fetchData()
}

const initTableData = async () => {
    filteredTemplates.value = await queryAll()
    total.value = filteredTemplates.value.length
    fetchData()
}

// 搜索文本
const searchText = ref('');

// 上传对话框
const uploadDialogVisible = ref(false);
const uploadForm = ref({ templateType: '', file: null });
const fileList = ref([]);

// 打开上传对话框
const openUploadDialog = () => {
    uploadDialogVisible.value = true;
};

// 预览、下载和删除操作
const previewTemplate = (template) => {
    console.log('预览模板:', template);
};
const downloadTemplate = (template) => {
    console.log('下载模板:', template);
};
const deleteTemplate = (template) => {
    console.log('删除模板:', template);
};

// 上传相关操作
const handlePreview = (file) => {
    console.log('预览文件:', file);
};
const handleRemove = (file, fileList) => {
    console.log('移除文件:', file, fileList);
};
const beforeUpload = (file) => {
    console.log('准备上传文件:', file);
    return true; // 返回 false 则停止上传
};
const submitUpload = () => {
    console.log('上传表单:', uploadForm.value);
    uploadDialogVisible.value = false;
};

// export default {
//     name: 'TemplateManagement',
//     setup() {
//         // 模板数据
//         const templates = ref([
//             { templateId: 'T001', templateName: '发明专利模板', uploadTime: '2024-10-01', updateTime: '2024-10-01', userId: 'Candice', remarks: '-' },
//             { templateId: 'T005', templateName: '其他成果模板', uploadTime: '2024-10-01', updateTime: '2024-10-01', userId: 'Carlos Rios', remarks: '-' },
//         ]);

//         // 过滤后的模板数据
//         const filteredTemplates = computed(() => {
//             let filtered = templates.value;
//             if (searchText.value) {
//                 filtered = filtered.filter(
//                     (template) =>
//                         template.templateId.includes(searchText.value) ||
//                         template.templateName.includes(searchText.value)
//                 );
//             }
//             const start = (currentPage.value - 1) * pageSize.value;
//             return filtered.slice(start, start + pageSize.value);
//         });

//         return {
//             searchText,
//             templates,
//             filteredTemplates,
//             currentPage,
//             pageSize,
//             uploadDialogVisible,
//             uploadForm,
//             fileList,
//             openUploadDialog,
//             previewTemplate,
//             downloadTemplate,
//             deleteTemplate,
//             handlePreview,
//             handleRemove,
//             beforeUpload,
//             submitUpload,
//         };
//     },
// };
</script>

<style scoped>
.header-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
    margin-top: 20px;
}

.upload-button {
    margin-top: 20px;
    text-align: right;
}
</style>

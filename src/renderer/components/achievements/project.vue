<template>
    <div class="project-management">
        <!-- 搜索框 -->
        <div style="margin-top: 10px;display: flex;justify-content: center">
            <el-input v-model="keywords" placeholder="请输入项目名称查询" style="width: 400px;margin-right: 10px"
                @keydown.enter.native="doSearch"></el-input>
            <el-button :icon="Search" type="primary" @click="doSearch">搜索</el-button>
            <el-button type="success" @click="openAddView" style="margin-left: 10px">
                新增项目
            </el-button>
        </div>

        <!-- 项目信息表格 -->
        <div style="margin-top: 10px">
            <el-table :data="projectData" style="width: 100%;"
                :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
                <el-table-column prop="projectId" label="项目ID" width="150" />
                <el-table-column prop="projectName" label="项目名称" width="200" />
                <el-table-column prop="organizationId" label="牵头单位" width="200" :formatter="formatOrganizationName" />
                <el-table-column prop="projectIntro" label="项目简介" />
                <el-table-column label="操作" width="200">
                    <template #default="scope">
                        <el-button size="small" type="success" @click="openEditView(scope.row)">
                            编辑
                        </el-button>
                        <el-button size="small" type="danger" @click="deleteProject(scope.row)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="margin-top: 30px;">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background
                    @size-change="handlePageSizeChange" @current-change="handleCurrentChange"
                    :page-sizes="[10, 15, 25]" layout="total, sizes, prev, pager, next, jumper" :total="total">
                </el-pagination>
            </div>
        </div>

        <!-- 编辑项目信息弹出框 -->
        <el-dialog title="编辑项目信息" v-model="editDialogVisible" width="500px" center
            :close-on-click-modal="false">
            <el-form ref="projectRef" :model="currentProject" :rules="rules" label-width="auto">
                <el-form-item label="项目名称" prop="projectName">
                    <el-input v-model="currentProject.projectName" />
                </el-form-item>
                <el-form-item label="牵头单位" prop="organizationId">
                    <el-select v-model="currentProject.organizationId" placeholder="请选择牵头单位">
                        <el-option
                            v-for="item in organizationList"
                            :key="item.organizationId"
                            :label="item.organizationName"
                            :value="item.organizationId"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="项目简介" prop="projectIntro">
                    <el-input v-model="currentProject.projectIntro" type="textarea" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="editProjectInfo(projectRef)">确 定</el-button>
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!-- 添加项目信息弹出框 -->
        <el-dialog title="添加项目" v-model="addDialogVisible" width="500px" center
            :close-on-click-modal="false">
            <el-form ref="addProjectRef" :model="newProject" :rules="rules" label-width="auto">
                <el-form-item label="项目名称" prop="projectName">
                    <el-input v-model="newProject.projectName" />
                </el-form-item>
                <el-form-item label="牵头单位" prop="organizationId">
                    <el-select v-model="newProject.organizationId" placeholder="请选择牵头单位">
                        <el-option
                            v-for="item in organizationList"
                            :key="item.organizationId"
                            :label="item.organizationName"
                            :value="item.organizationId"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="项目简介" prop="projectIntro">
                    <el-input v-model="newProject.projectIntro" type="textarea" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addProjectInfo(addProjectRef)">确 定</el-button>
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { 
    getProjectById, 
    editProject, 
    deleteProject as deleteProjectApi, 
    getProjectsWithPagination,
    addProject
} from "../../api/project"
import { getAllCompanies } from "../../api/companyInfo"

const projectData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)
const keywords = ref("")

const editDialogVisible = ref(false)
const projectRef = ref(null)
const currentProject = ref({
    projectId: 0,
    projectName: '',
    organizationId: '',
    projectIntro: '',
    tableStatus:true
})

const addDialogVisible = ref(false)
const addProjectRef = ref(null)
const newProject = ref({
    projectName: '',
    organizationId: '',
    projectIntro: '',
    tableStatus:true
})

// 模拟的单位列表（替换为从后端获取的真实数据）
const organizationList = ref([]);

const rules = ref({
    projectName: [
        { required: true, message: '请输入项目名称', trigger: 'blur' },
        { max: 255, message: '名称长度不超过255个字符', trigger: 'blur' },
    ],
    organizationId: [
        { required: true, message: '请输入牵头单位', trigger: 'blur' },
    ],
    projectIntro: [
        { required: true, message: '请输入项目简介', trigger: 'blur' },
    ]
})

onMounted(async () => {
    await fetchData()
    await fetchOrganizationList()
})

const fetchData = async () => {
    try {
        const res = await getProjectsWithPagination(currentPage.value, pageSize.value)
        projectData.value = res
        total.value = res.total
    } catch (error) {
        console.error('Error fetching project data: ', error)
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

const deleteProject = (row) => {
    ElMessageBox.confirm('确定要删除该项目吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        await deleteProjectApi(row.projectId)
        ElMessage.success('删除成功')
        await fetchData()
    }).catch(() => {
        ElMessage.info('已取消删除')
    })
}

const openEditView = async (row) => {

    const res = await getProjectById(row.projectId)
    currentProject.value = res
    editDialogVisible.value = true
}

const editProjectInfo = (formRef) => {
    formRef.validate(async (valid) => {
        if (valid) {
            await editProject(currentProject.value)
            ElMessage.success('修改成功')
            editDialogVisible.value = false
            await fetchData()
        }
    })
}

const openAddView = () => {
    newProject.value = {
        projectName: '',
        organizationId: '',
        projectIntro: '',
        tableStatus:true
    }
    addDialogVisible.value = true
}

const addProjectInfo = (formRef) => {
    formRef.validate(async (valid) => {
        if (valid) {
            try {
                await addProject(newProject.value)
                ElMessage.success('添加成功')
                addDialogVisible.value = false
                await fetchData()
            } catch (error) {
                ElMessage.error('添加失败')
                console.error('Error adding project:', error)
            }
        }
    })
}

const doSearch = async () => {
    // 实现搜索逻辑
}

// 格式化牵头单位显示
const formatOrganizationName = (row) => {
    const organization = organizationList.value.find(item => item.organizationId === row.organizationId);
    return organization ? organization.organizationName : '未知单位';
};

// 获取单位列表的方法
const fetchOrganizationList = async () => {
    try {
        const res = await getAllCompanies();
        if (res ) {
            organizationList.value = res.map(company => ({
                organizationId: company.organizationId,
                organizationName: company.organizationName
            }));
        } else {
            ElMessage.error('获取单位列表失败');
        }
    } catch (error) {
        console.error('Error fetching organization list:', error);
        ElMessage.error('获取单位列表时出错');
    }
};
</script>

<style scoped>
.project-management {
    padding: 20px;
}
</style>

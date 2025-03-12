<template>
    <div class="result-management">
        <!-- 搜索框 -->
        <div style="margin-top: 10px;display: flex;justify-content: center">
            <el-input v-model="keywords" placeholder="请输入关键字查询" style="width: 400px;margin-right: 10px"
                @keydown.enter.native="doSearch"></el-input>
            <el-button :icon="Search" type="primary" @click="doSearch">搜索</el-button>
        </div>

        <!-- 分类按钮，成果信息表格 -->
        <div style="margin-top: 10px">
            <el-tabs type="border-card" v-model="testType" @tab-click="clickTab">
                <el-tab-pane v-for="(item, index) in typeData" :key="index" :label="item.label" :name="item.name">
                    <el-table :data="achievementData" style="width: 100%;"
                        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
                        <el-table-column prop="achievementId" label="成果编号" width="150" />
                        <el-table-column prop="achievementName" label="成果名称" width="200" />
                        <el-table-column prop="achievementCategory" label="成果类型" width="150" />
                        <el-table-column prop="projectNo" label="项目编号" width="150" />
                        <el-table-column prop="userName" label="发布用户" width="150" />
                        <el-table-column prop="organizationName" label="所属单位" width="150" />
                        <el-table-column prop="searchCount" label="下载次数" />
                        <el-table-column label="操作" width="200">
                            <template #default="scope">
                                <el-button size="small" type="success" @click="openEditView(scope.row)">
                                    编辑
                                </el-button>
                                <el-button size="small" type="danger" @click="deleteResult(scope.row)">
                                    删除
                                </el-button>
                                <el-button size="small" @click="moreDetails(scope.row)">更多</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div style="margin-top: 30px;">
                        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" background
                            @size-change="handlePageSizeChange" @current-change="handleCurrentChange"
                            :page-sizes="[2, 8, 15]" layout="total, sizes, prev, pager, next, jumper" :total="total">
                        </el-pagination>
                    </div>
                </el-tab-pane>
            </el-tabs>
            <!-- 修改成果信息弹出框-->
            <div>
                <el-dialog title="编辑成果信息" v-model="editDialogVisible" width="500px" center
                    :close-on-click-modal="false">
                    <el-form ref="resultsRef" :model="thisAchieveInfo" :rules="rules" label-width="auto">
                        <el-form-item label="成果名称" prop="achievementName">
                            <el-input v-model="thisAchieveInfo.achievementName" />
                        </el-form-item>
                        <!-- <el-form-item label="成果类型" prop="achievementCategory">
                                    <el-radio-group v-model="thisAchieveInfo.achievementCategory" prop="achievementCategory">
                                        <el-radio label="项目专利">项目专利</el-radio>
                                        <el-radio label="项目论文">项目论文</el-radio>
                                        <el-radio label="其他成果">其他成果</el-radio>
                                    </el-radio-group>
                                </el-form-item> -->
                        <el-form-item label="成果类型" prop="achievementCategory">
                            <el-input v-model="thisAchieveInfo.achievementCategory" type="textarea" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="editAchieveInfo(resultsRef)">确 定</el-button>
                            <el-button @click="editDialogVisible = false">取 消</el-button>
                        </el-form-item>
                    </el-form>
                </el-dialog>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { deleteItem, queryAll, queryAllWithPagination, queryAllWithPatent, queryAllWithPaper, queryAllWithOthers, update } from "../../api/achieveInfo"

const achievementData = ref([])   //成果数据列表
const total = ref(0)   //成果总数据量
const currentPage = ref(1)  // 当前页码
const pageSize = ref(15)  // 每页数量（可通过下拉框选择）
const testType = ref("全部")
const keywords = ref("")
const typeData = ref([
    {
        name: "全部",
        label: "全部"
    },
    {
        name: "项目专利",
        label: "项目专利"
    },
    {
        name: "项目论文",
        label: "项目论文"
    },
    {
        name: "其他成果",
        label: "其他成果"
    }
])


const editDialogVisible = ref(false)
const resultsRef = ref(null)
const thisAchieveInfo = ref({
    achievementId: 0,
    achievementName: '',
    //isParament: '否',
    //achievementCategory: '文档审查',
    //description: '',
    achievementCategory: '',
    //expectedResult: '',
    //testObject: '',
    //index3Type: ''
})   //当前成果信息

const rules = ref({
    achievementName: [
        { required: true, message: '请输入成果名称', trigger: 'blur' },
        { max: 255, message: '名称长度不超过63个字符', trigger: 'blur' },
    ],
    // organizationName: [
    //     { required: true, message: '所属单位不能为空', trigger: 'blur' },
    // ]
    achievementCategory: [
        { required: true, message: '请选择成果类型', trigger: 'blur' },
    ]
})




//进入页面后，获取成果总数量，获取第一页数据
onMounted(async () => {
    achievementData.value = await queryAll()   //链接后端请求获取数据
    total.value = achievementData.value.length
    fetchData()
})

const doSearch = async () => {

}

// 根据成果类别进行查询
const clickTab = async (tab) => {
    if (tab.props.name === "全部") {
        currentPage.value = 1
        pageSize.value = 2
        total.value = 12   //该值应该从后端获取，等WCL提供接口
        achievementData.value = await queryAllWithPagination(currentPage.value, pageSize.value)
    } else if (tab.props.name === "项目专利") {
        currentPage.value = 1
        pageSize.value = 2
        total.value = 3
        achievementData.value = await queryAllWithPatent(currentPage.value, pageSize.value)
    } else if (tab.props.name === "项目论文") {
        currentPage.value = 1
        pageSize.value = 2
        total.value = 4
        achievementData.value = await queryAllWithPaper(currentPage.value, pageSize.value)
    } else if (tab.props.name === "其他成果") {
        currentPage.value = 1
        pageSize.value = 2
        total.value = 5
        achievementData.value = await queryAllWithOthers(currentPage.value, pageSize.value)
    }
}


// 分页获取数据
const fetchData = async () => {
    try {
        //console.log("testType.value = ", testType.value);
        if (testType.value === "全部") {
            //  console.log("查询全部");
            achievementData.value = await queryAllWithPagination(currentPage.value, pageSize.value)
        } else if (testType.value === "项目专利") {
            //  console.log("查询项目专利");
            achievementData.value = await queryAllWithPatent(currentPage.value, pageSize.value)
        } else if (testType.value === "项目论文") {
            //   console.log("查询项目论文");
            achievementData.value = await queryAllWithPaper(currentPage.value, pageSize.value)
        } else if (testType.value === "其他成果") {
            //  console.log("查询其他成果");
            achievementData.value = await queryAllWithOthers(currentPage.value, pageSize.value)
        }
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
    achievementData.value = await queryAll()
    total.value = achievementData.value.length
    fetchData()
}

const deleteResult = (row) => {
    ElMessageBox.confirm('删除本条成果, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        await deleteItem(row.achievementId)
        initTableData()
    }).catch(() => {
        ElMessage({
            type: 'info',
            message: '已取消删除操作'
        })
    })
}



const editAchieveInfo = (resultsRef) => {
    resultsRef.validate(async (valid) => {
        if (valid) {
            console.log("12345=", thisAchieveInfo.value)
            await update(thisAchieveInfo.value)
            initTableData()
            editDialogVisible.value = false
        }
    })
}

const openEditView = (row) => {
    thisAchieveInfo.value.achievementName = row.achievementName
    thisAchieveInfo.value.achievementCategory = row.achievementCategory

    thisAchieveInfo.value.achievementId = row.achievementId
    resultsRef.value = null
    editDialogVisible.value = true
}


</script>

<style scoped>
/* 使用 Flexbox 布局 */
.filter-section {
    display: flex;
    justify-content: space-between;
    /* 左右两部分 */
    align-items: center;
    /* 垂直居中 */
    margin-bottom: 20px;
    margin-top: 20px;
}

.filter-buttons {
    display: flex;
    gap: 10px;
    /* 按钮之间的间距 */
}
</style>
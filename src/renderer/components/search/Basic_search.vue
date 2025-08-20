<template>
    <div class="search-container">
        <!-- 搜索区域 -->
        <div class="search-header">
            <div class="search-box">
                <i class="fas fa-search search-icon"></i>
                <input 
                    v-model="searchQuery" 
                    class="search-input" 
                    type="text" 
                    placeholder="请输入搜索关键词"
                    @keyup.enter="handleSearch"
                >
                <button class="search-button" @click="handleSearch">
                    <span>搜索</span>
                </button>
            </div>
        </div>

        <div class="main-content" v-if="searchResults.length">
            <!-- 左侧筛选栏 -->
            <div class="filter-sidebar">
                <!-- 课题分类 -->
                <div class="filter-section">
                    <h3>课题分类</h3>
                    <div v-for="subject in subjects" :key="subject.id" class="filter-item">
                        <input type="checkbox" 
                               :id="subject.id" 
                               v-model="selectedSubjects"
                               :value="subject.value"
                               @change="filterResults">
                        <label :for="subject.id">{{ subject.label }} ({{ subject.count }})</label>
                    </div>
                </div>

                <!-- 技术筛选 -->
                <div class="filter-section">
                    <h3>技术分类</h3>
                    <div v-for="topic in topics" :key="topic.id" class="filter-item">
                        <input type="checkbox" 
                               :id="topic.id" 
                               v-model="selectedTopics"
                               :value="topic.id"
                               @change="filterResults">
                        <label :for="topic.id">{{ topic.name }} ({{ topic.count }})</label>
                    </div>
                </div>

                <!-- 成果类型筛选 -->
                <div class="filter-section">
                    <h3>成果类型</h3>
                    <div v-for="type in resultTypes" :key="type.id" class="filter-item">
                        <input type="checkbox" 
                               :id="type.id" 
                               v-model="selectedTypes"
                               :value="type.value"
                               @change="filterResults">
                        <label :for="type.id">{{ type.name }}</label>
                    </div>
                </div>
            </div>

            <!-- 右侧结果区域 -->
            <div class="results-area">
                <!-- 结果头部 -->
                <div class="result-header">
                    <div class="left-actions">
                        <!-- <span class="result-count">找到 {{ totalResults }} 个结果</span> -->
                        <button 
                            v-if="selectedItems.length" 
                            class="batch-download-btn"
                            @click="handleBatchDownload"
                        >
                            批量下载 ({{ selectedItems.length }})
                        </button>
                        <button 
                            v-if="selectedItems.length" 
                            class="batch-schedule-btn"
                            @click="handleBatchScheduleDownload"
                        >
                            定时下载 ({{ selectedItems.length }})
                        </button>
                    </div>
                    <div class="sort-container">
                        <span class="sort-label">排序方式</span>
                        <select v-model="sortBy" class="sort-select" @change="handleSort">
                            <option value="newest">最新</option>
                            <option value="views">下载量</option>
                        </select>
                        <span class="sort-label ml-15">每页显示</span>
                        <select v-model="pageSize" class="sort-select" @change="handlePageSizeChange">
                            <option :value="5">5条</option>
                            <option :value="10">10条</option>
                            <option :value="20">20条</option>
                            <option :value="50">50条</option>
                        </select>
                        <span class="sort-label ml-15">优先展示</span>
                        <select v-model="priorityType" class="sort-select" @change="handlePriorityChange">
                            <option value="">无优先</option>
                            <option value="paper">论文</option>
                            <option value="patent">专利</option>
                            <option value="project">项目</option>
                            <option value="report">技术报告</option>
                            <option value="technology">技术类成果</option>
                            <option value="system">系统类成果</option>
                            <option value="software">软件类成果</option>
                            <option value="hardware">硬件类成果</option>
                        </select>
                    </div>
                </div>

                <!-- 表头 -->
                <div class="results-table">
                    <div class="table-header">
                        <div class="column-checkbox">
                            <input 
                                type="checkbox" 
                                @change="selectAll" 
                                :checked="isAllSelected"
                            >
                        </div>
                        <div class="column-title">成果名称</div>
                        <div class="column-type">类型</div>
                        <div class="column-version">版本</div>
                        <div class="column-author">作者</div>
                        <div class="column-project">项目</div>
                        <div class="column-org">单位</div>
                        <div class="column-actions">操作</div>
                    </div>

                    <!-- 搜索结果列表 -->
                    <div class="table-body">
                        <div v-for="(item, index) in paginatedResults" 
                             :key="index" 
                             class="table-row"
                             :class="{ 'priority-result': item.type === priorityType.value }">
                            <div class="column-checkbox">
                                <input 
                                    type="checkbox" 
                                    :value="item.id"
                                    v-model="selectedItems"
                                >
                            </div>
                            <div class="column-title">
                                <div class="title-content">
                                    <h3 @click="navigateToDetail(item)" class="clickable-title">{{ item.title }}</h3>
                                    <p class="description">{{ item.description }}</p>
                                    <div class="meta-info">
                                        <span class="meta-item">
                                            <i class="far fa-calendar-alt"></i>
                                            {{ item.uploadDate }}
                                        </span>
                                        <span class="meta-item">
                                            <i class="far fa-eye"></i>
                                            {{ item.views }} 次下载
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="column-type">
                                <span class="type-tag">{{ getTypeChineseName(item.type) }}</span>
                            </div>
                            <div class="column-version">{{ item.version || '-' }}</div>
                            <div class="column-author">{{ item.author }}</div>
                            <div class="column-project">{{ item.project }}</div>
                            <div class="column-org">{{ item.organization }}</div>
                            <div class="column-actions">
                                <button class="action-btn download" @click="handleSave(item)">
                                    <i class="fas fa-download"></i>
                                    下载
                                </button>
                                <button class="action-btn schedule" @click="handleScheduleDownload(item)">
                                    <i class="fas fa-clock"></i>
                                    定时下载
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 分页控件 - 移动到成果列表最下方 -->
            <div class="pagination-container" v-if="totalPages > 1">
                <button 
                    class="pagination-btn" 
                    :disabled="currentPage === 1"
                    @click="goToPage(currentPage - 1)"
                >
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <button 
                    v-for="page in displayedPages" 
                    :key="page" 
                    class="pagination-btn" 
                    :class="{ active: currentPage === page }"
                    @click="goToPage(page)"
                >
                    {{ page }}
                </button>
                
                <button 
                    class="pagination-btn" 
                    :disabled="currentPage === totalPages"
                    @click="goToPage(currentPage + 1)"
                >
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <!-- Add face component when no search results -->
        <div class="kg-container" v-if="!searchResults.length">
            <face />
        </div>

        <!-- 添加定时下载对话框 -->
        <div class="download-dialog-overlay" v-if="showScheduleDialog">
            <div class="download-dialog">
                <div class="dialog-header">
                    <h3>安排定时下载</h3>
                    <button class="close-btn" @click="cancelScheduleDownload">&times;</button>
                </div>
                <div class="dialog-content">
                    <p>您正在为 <span class="highlight">{{ scheduledItems.length > 1 ? '多个文件' : scheduledItems[0]?.title }}</span> 安排下载时间</p>
                    
                    <div class="schedule-options">
                        <div class="schedule-option">
                            <label>选择下载时间：</label>
                            <input type="datetime-local" 
                                   v-model="scheduledTime" 
                                   :min="minScheduleTime"
                                   class="schedule-time-input">
                        </div>
                    </div>

                    <div class="file-list" v-if="scheduledItems.length > 1">
                        <h4>将下载以下 {{ scheduledItems.length }} 个文件：</h4>
                        <ul>
                            <li v-for="(item, index) in scheduledItems" :key="index" class="file-item">
                                <i class="far fa-file"></i>
                                {{ item.title }}
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="cancel-btn" @click="cancelScheduleDownload">取消</button>
                    <button class="confirm-btn" @click="confirmScheduleDownload">
                        <i class="fas fa-clock"></i>
                        确认安排
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, watchEffect, onBeforeUnmount, nextTick } from 'vue';
import { fuzzySearchAchievements, preciseSearchAchievements } from '../../api/search';
import { submitDownloadForm, downloadAchievements, deleteAchievementFile } from '../../api/download';
import emitter from '../../utils/eventBus';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElLoading } from 'element-plus';
import { queryById } from '../../api/achieveInfo';
import { getProjectById } from '../../api/project';
import axios from 'axios';
import { getToken } from '../../http/token';
import request from "../../http/request";
import face from './face.vue';
const { ipcRenderer } = window.electron;

let loading = null;
 
const download_name = ref('');
const route = useRoute();
const router = useRouter();
const progress = ref(0);
const progress_isshow = ref(false);
const searchQuery = ref('');
const isLoading = ref(false)
const searchType = ref('fuzzy')
const searchResults = ref([]);
const sortBy = ref('newest');
const selectedItems = ref([]);
const selectedSubjects = ref([]);
const selectedTopics = ref([]);
const selectedTypes = ref([]);
const allResults = ref([]);
const selectedDateRange = ref([])
const selectedOrgs = ref([])
const selectedPath = ref([])
const searchSubject = ref([]);
const searchTechnology= ref([]);
const subjects = ref([
    { id: 1, label: '课题1', value: 'subject1' },
    { id: 2, label: '课题2', value: 'subject2' },
    { id: 3, label: '课题3', value: 'subject3' },
    { id: 4, label: '课题4', value: 'subject4' },
    { id: 5, label: '课题5', value: 'subject5' },
]);
const topics = ref([
    { id: 1, name: '前端',  },
    { id: 2, name: '后端'},
    { id: 3, name: '框架'},
    { id: 4, name: '计算'},
    { id: 5, name: '通信'},
    { id: 6, name: '测试'},

]);
const resultTypes = ref([
    { id: 1, name: '技术类成果', value: 'technology' },
    { id: 2, name: '系统类成果', value: 'system' },
    { id: 3, name: '软件类成果', value: 'software' },
    { id: 4, name: '硬件类成果', value: 'hardware' },
    { id: 5, name: '论文', value: 'paper' },
    { id: 6, name: '专利', value: 'patent' },
    { id: 7, name: '科研项目', value: 'project' },
    { id: 8, name: '技术报告', value: 'report' }
]);

const isAllSelected = computed(() => {
    return searchResults.value.length > 0 && selectedItems.value.length === searchResults.value.length;
});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const totalResults = computed(() => allResults.value.length);
const totalPages = computed(() => Math.ceil(searchResults.value.length / pageSize.value));

// 计算当前页显示的结果
const paginatedResults = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    const results = searchResults.value.slice(startIndex, endIndex);
    
    return results;
});

// 计算要显示的页码按钮
const displayedPages = computed(() => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages.value <= maxVisiblePages) {
        // 如果总页数小于等于最大可见页数，显示所有页码
        for (let i = 1; i <= totalPages.value; i++) {
            pages.push(i);
        }
    } else {
        // 否则，显示当前页附近的页码
        let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;
        
        if (endPage > totalPages.value) {
            endPage = totalPages.value;
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
    }
    
    return pages;
});

// 跳转到指定页
const goToPage = (page) => {
    currentPage.value = page;
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 处理每页显示数量变化
const handlePageSizeChange = () => {
    console.log('页面大小改变为:', pageSize.value);
    currentPage.value = 1; // 重置到第一页
    console.log('当前页重置为:', currentPage.value);
    console.log('计算的总页数:', totalPages.value);
    console.log('当前页显示的结果数量:', paginatedResults.value.length);
};

const handleSearch = async () => {
    try {
        let response;
        const searchbody = {
            keywords: [searchQuery.value]
        }
        console.log("handleSearch searchbody",searchbody)
        response = await fuzzySearchAchievements(searchbody);

        console.log('搜索结果:', response);

        if (Array.isArray(response)) {
            // 获取所有成果的详细信息
            const detailedResults = await Promise.all(response.map(async item => {
                try {
                    const detail = await queryById(item.achievementId);
                    let projectName = item.projectId;
                    // 如果projectId存在，尝试获取项目名称
                    if (item.projectId) {
                        try {
                            const companyInfo = await getProjectById(item.projectId);
                            projectName = companyInfo.projectName || item.projectId;
                        } catch (error) {
                            console.error(`获取项目${item.projectId}信息失败:`, error);
                        }
                    }
                    console.log("detail",detail)
                    return {
                        id: item.achievementId,
                        title: item.achievementName,
                        type: item.achievementCategory?.toLowerCase(),
                        version: item.achievementVersion,
                        author: detail.userName || item.userName,
                        project: projectName, // 使用获取到的项目名称
                        organization: detail.organizationName || item.organizationName,
                        description: item.achievementIntro,
                        uploadDate: item.uploadTime?.substring(0, 10) || '',
                        views: item.achievementDownloadCount || 0
                    };
                } catch (error) {
                    console.error(`获取成果${item.achievementId}详情失败:`, error);
                    return {
                        id: item.achievementId,
                        title: item.achievementName,
                        type: item.achievementCategory?.toLowerCase(),
                        version: item.achievementVersion,
                        author: item.userName,
                        project: item.projectId,
                        organization: item.organizationName,
                        description: item.achievementIntro,
                        uploadDate: item.uploadTime?.substring(0, 10) || '',
                        views: item.achievementDownloadCount || 0
                    };
                }
            }));

            allResults.value = detailedResults;
            console.log("allResults basic", allResults.value);
            filterResults();
            handleSort();
        } else {
            allResults.value = [];
            searchResults.value = [];
        }
    } catch (error) {
        console.error('[Search] 搜索失败:', error);
        allResults.value = [];
        searchResults.value = [];
    }
};

// 下载对话框相关变量
const showDownloadDialog = ref(false);
const downloadPath = ref('C:/data/download/');
const defaultDownloadPath = ref('C:/data/download/'); // 默认下载路径
const downloadItems = ref([]);
const currentDownloadType = ref('single'); // 'single' 或 'batch'
const showCustomPathInput = ref(false); // 控制是否显示自定义路径输入框

// 修改下载处理函数
const handleDownload = async (item) => {
    console.log('准备下载成果:', item);
    // 设置下载项目和类型
    downloadItems.value = [item];
    currentDownloadType.value = 'single';
    // 隐藏自定义路径输入框（初始状态）
    showCustomPathInput.value = false;
    // 显示下载确认对话框
    showDownloadDialog.value = true;
};

// 修改批量下载处理函数
const handleBatchDownload = async () => {
    if (!selectedItems.value.length) {
        console.log('没有选中任何项目，无法批量下载');
        return;
    }
    
    console.log('准备批量下载 - 选中项目:', selectedItems.value);
    
    // 获取选中项目的详细信息
    const selectedItemsDetails = searchResults.value.filter(item => 
        selectedItems.value.includes(item.id)
    );
    
    // 设置下载项目和类型
    downloadItems.value = selectedItemsDetails;
    currentDownloadType.value = 'batch';
    console.log('currentDownloadType',currentDownloadType.value)
    // 隐藏自定义路径输入框（初始状态）
    showCustomPathInput.value = false;
    // 显示下载确认对话框
    showDownloadDialog.value = true;
    await downloadFiles(false);

};

// 取消下载
const cancelDownload = () => {
    showDownloadDialog.value = false;
    downloadItems.value = [];
    showCustomPathInput.value = false;
    console.log('下载已取消');
};

// 浏览文件夹路径
const browseDownloadPath = async (blob,fileName) => {
    try {
        // 检查是否有 electron 对象
        if (!window.electron) {
            console.error('Electron API 不可用');
            ElMessage.warning('在此环境中无法选择文件夹，请手动输入路径');
            return;
        }
        
        // 使用预先暴露的 API
        //给主进程发消息打开文件夹选择对话框，并返回选择的路径
        window.api.send('open_folder_dialog');
        window.api.receive_folder_path(async (event, path) => {
            console.log('收到主进程返回的路径:', path);
            downloadPath.value = path;
            //分块传输
            const chunkSize = 1024 * 1024; // 1MB
            const totalSize = blob.size;
            const chunkCount = Math.ceil(totalSize / chunkSize);
            let offset = 0;
            for (let i = 0; i < chunkCount; i++) {
                const chunk = blob.slice(offset, offset + chunkSize);
                const arrayBuffer = await chunk.arrayBuffer();
                await ipcRenderer.invoke('save_file', {
                    blob: arrayBuffer,
                    fileName: fileName,
                    savePath: path,
                    chunkIndex: i,
                    totalChunks: chunkCount
                });
                offset += chunkSize;
            }
            const downloadRecord = {
                path: path,
                fileName: fileName,
                timestamp: new Date().toISOString()
            };
            console.log('downloadRecord',downloadRecord)
            const existingRecords = JSON.parse(localStorage.getItem('downloadPaths') || '[]');
            existingRecords.push(downloadRecord);
            localStorage.setItem('downloadPaths', JSON.stringify(existingRecords));

                        
            // const arrayBuffer = await blob.arrayBuffer();
        
            // let result = await ipcRenderer.invoke('save_file', {
            //     blob: arrayBuffer,
            //     fileName: fileName,
            //     savePath: path
            // });
            // if(result){
            //     ElMessage.success('文件保存成功');
            // }else{
            //     ElMessage.error('文件保存失败');
            // }
           
        });

        
    } catch (error) {
        console.error('打开文件夹选择对话框时出错:', error);
        ElMessage.warning('无法打开文件夹选择对话框，请手动输入路径');
    }
};

// 直接保存到默认路径
const handleSave = async (item) => {
    progress_isshow.value = true;
    loading = ElLoading.service({
        lock: true,
        text: '开始下载...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    
    // Set the download item
    downloadItems.value = [item];
    currentDownloadType.value = 'single';
    downloadPath.value = defaultDownloadPath.value;

    await downloadFiles(false);
};









// 下载文件的统一处理函数
const downloadFiles = async (openAfterDownload = false) => {
    try {
        showDownloadDialog.value = false;
        console.log('currentDownloadType',currentDownloadType.value)
        const userIdStr = localStorage.getItem('userId');
        const userId = userIdStr ? parseInt(userIdStr, 10) : null; 
        
        // 创建初始下载记录对象，所有状态为false
        let downloadRecord = {
            downloadName: '',
            downloadTime: new Date().toISOString(),
            downloadPath: downloadPath.value,
            downloadSubmitted: false,
            downloadSuccess: false
        };
        console.log('初始下载记录:', downloadRecord);
        
        if (currentDownloadType.value === 'single') {
            // 单个文件下载
            const achievementIds = [downloadItems.value[0].id];
            console.log('提交下载表单 - 成果ID:', achievementIds);
            
            // 第一步：提交下载表单
            const fileNames = await submitDownloadForm(achievementIds, userId);
            console.log('下载表单提交响应:', fileNames);
            
            // 更新下载记录 - 表单已提交
            downloadRecord = {
                ...downloadRecord,
                downloadName: fileNames[0],
                downloadSubmitted: true,
                downloadSuccess: false
            };
            console.log('表单提交后下载记录:', downloadRecord);
            
            if (fileNames && Array.isArray(fileNames) && fileNames.length > 0) {
                // 第二步：执行文件下载
                const success = await downloadAndSaveFile(fileNames, openAfterDownload);
                console.log('单个成果下载完成, 是否打开:', openAfterDownload);
                
                // 更新下载记录 - 下载状态
                downloadRecord = {
                    ...downloadRecord,
                    downloadSuccess: success
                };
                console.log('下载完成后下载记录:', downloadRecord);
                
                if (success) {
                    ElMessage.success(`下载成功！${openAfterDownload ? '文件将自动打开' : '文件已保存'}`);
                }
            }
        } else {
            download_name.value='';
            // 批量下载
            const achievementIds = downloadItems.value.map(item => item.id);
            console.log('提交批量下载表单 - 成果ID列表:', achievementIds);
            
            // 第一步：提交下载表单
            const fileNames = await submitDownloadForm(achievementIds, userId);
            console.log('批量下载表单提交响应:', fileNames);
            
            // 更新下载记录 - 表单已提交
            downloadRecord = {
                ...downloadRecord,
                downloadName: Array.isArray(fileNames) ? fileNames.join(',') : fileNames,
                downloadSubmitted: true,
                downloadSuccess: false
            };
            console.debug('批量下载表单已提交，更新下载记录:', downloadRecord);
            
            if (fileNames && Array.isArray(fileNames) && fileNames.length > 0) {
                // 第二步：执行文件下载
                const success = await downloadAndSaveFile(fileNames, openAfterDownload);
                console.log('name', download_name.value);
                
                // 更新下载记录 - 下载状态
                downloadRecord = {
                    ...downloadRecord,
                    downloadSuccess: success
                };
                console.debug('批量下载完成，最终下载记录:', downloadRecord);
                
                if (success) {
                    ElMessage.success(`批量下载成功！${openAfterDownload ? '文件将自动打开' : '文件已保存'}`);
                    if (download_name.value.length>0 ) {
                        // Clean the filename by removing quotes and other unwanted characters
                        const cleanedFileName = download_name.value.replace(/["':]/g, '');
                        deleteAchievementFile(cleanedFileName);
                    }
                }
            } else {
                console.error('批量下载表单提交失败: 未返回有效的文件名');
                ElMessage.error('批量下载失败: 服务器未返回有效的文件名');
            }
        }
        
        // 输出最终下载记录作为调试信息
        console.debug('下载过程完成，最终下载记录:', downloadRecord);
        return downloadRecord;
    } catch (error) {
        console.error('下载过程发生错误:', error);
        nextTick(() => {
            loading.setText("下载失败");
        });
        setTimeout(() => {
            loading.close();
        }, 1000);
        ElMessage.error('下载失败，请稍后重试');
    } finally {
        // 清理下载项和自定义路径输入框状态
        downloadItems.value = [];
        showCustomPathInput.value = false;
    }
};

// 修改文件下载和保存函数，添加打开参数
const downloadAndSaveFile = async (fileNames, openAfterDownload = false) => {
    try {
        
        const fileNamesStr = Array.isArray(fileNames) ? fileNames.join(',') : fileNames;
        console.log('fileNamesStr',fileNamesStr);
        const response = await axios({
            url: 'http://localhost:8082/achievement/download',
            method: 'post', 
            // headers['token'] : getToken('token'),
            params: {
                fileNames: fileNamesStr,
               
                },
            responseType: 'blob',
            headers: {
                'Accept': 'application/octet-stream',  // 添加Accept头
                // 'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization' : "Bearer " + getToken('token')
                },
            onDownloadProgress: (progressEvent) => {
                // progress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                let progress_pen = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                console.log("progress_pen",progress_pen);
                nextTick(() => {
                    loading.setText("下载中..."+progress_pen+"%");

                });
            }
        }

    )

        console.log('下载API响应类型:', response.headers.get('content-disposition').split('filename=')[1]);
        download_name.value = response.headers.get('content-disposition').split('filename=')[1];
        nextTick(() => {
            loading.setText("下载完成");
        });
        setTimeout(() => {

            loading.close();
        }, 1000);

        // 创建Blob对象
        const blob = new Blob([response.data], { type: response.data.type || 'application/octet-stream' });
        
        let fileName;
        if (fileNames.length === 1) {
            fileName = fileNames[0];
        } else {
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
            fileName = `批量下载_${timestamp}.zip`;
        }
        browseDownloadPath(blob,fileName);

        // 使用更隐蔽的方式下载文件
        // const url = window.URL.createObjectURL(blob);
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = fileName;
        // link.style.display = 'none';
        // document.body.appendChild(link);
        
        // // 记录保存路径
        // const savePath = `${downloadPath.value}/${fileName}`;
        // console.debug(`文件保存路径: ${savePath}`);
        // console.debug('下载配置:', {
        //     fileNames: fileNames,
        //     downloadPath: downloadPath.value,
        //     savePath: savePath,
        //     openAfterDownload: openAfterDownload
        // });

        // // 模拟点击但不触发可见的系统对话框
        // link.click();
        
        // // 延迟一段时间后移除链接（确保下载开始）
        // setTimeout(() => {
        //     window.URL.revokeObjectURL(url);
        //     document.body.removeChild(link);
            
        //     // 如果设置了下载后打开，且是Electron环境，则尝试打开文件
        //     // 
        // }, 100);
        
        console.log('文件下载完成');

        // 在Electron环境中可以这样获取实际保存路径
        
        return true; // 返回成功状态
    } catch (error) {
        nextTick(() => {
            loading.setText("下载失败");
        });
        setTimeout(() => {
            loading.close();
        }, 1000);
        console.error('文件下载和保存过程出错:', error);
        ElMessage.error('下载失败，请稍后重试');
        throw error;
    }
};

const handleFavorite = (item) => {
    console.log('收藏:', item);
};

const selectAll = (event) => {
    selectedItems.value = event.target.checked ? searchResults.value.map(item => item.id) : [];
};

const filterResults = () => {
    // 首先创建一个临时结果数组
    let filteredResults = [...allResults.value];
    console.log('开始筛选，原始结果数量:', filteredResults.length);
    console.log('当前选中的课题分类:', selectedSubjects.value);
    console.log('当前选中的技术分类:', selectedTopics.value);
    console.log('当前选中的成果类型:', selectedTypes.value);
    
    // 检查一下第一个结果的数据结构
    if (filteredResults.length > 0) {
        console.log('第一个结果的数据结构:', JSON.stringify(filteredResults[0], null, 2));
    }
    
    // 按课题分类筛选
    if (selectedSubjects.value.length > 0) {
        console.log('按课题分类筛选前的结果数量:', filteredResults.length);
        // 暂时注释掉筛选逻辑，直到我们确认正确的字段名
        // filteredResults = filteredResults.filter(item => {
        //     console.log('检查项目的课题分类:', item.id, item.title, item.subjectCategory);
        //     return selectedSubjects.value.includes(item.subjectCategory);
        // });
        console.log('按课题分类筛选后的结果数量:', filteredResults.length);
    }
    
    // 按技术分类筛选
    if (selectedTopics.value.length > 0) {
        console.log('按技术分类筛选前的结果数量:', filteredResults.length);
        // 暂时注释掉筛选逻辑，直到我们确认正确的字段名
        // filteredResults = filteredResults.filter(item => {
        //     console.log('检查项目的技术分类:', item.id, item.title, item.topicId);
        //     return selectedTopics.value.includes(item.topicId);
        // });
        console.log('按技术分类筛选后的结果数量:', filteredResults.length);
    }
    
    // 按成果类型筛选
    if (selectedTypes.value.length > 0) {
        console.log('按成果类型筛选前的结果数量:', filteredResults.length);
        filteredResults = filteredResults.filter(item => {
            console.log('检查项目的成果类型:', item.id, item.title, item.type);
            return selectedTypes.value.includes(item.type);
        });
        console.log('按成果类型筛选后的结果数量:', filteredResults.length);
    }
    
    console.log('筛选完成，最终结果数量:', filteredResults.length);
    searchResults.value = filteredResults;
    currentPage.value = 1; // 重置到第一页
    handleSort();
};

// 添加优先展示类型
const priorityType = ref('');

// 处理优先类型变化
const handlePriorityChange = () => {
    console.log('优先展示类型改变为:', priorityType.value);
    handleSort(); // 重新排序结果
    currentPage.value = 1; // 重置到第一页
};

// 修改排序函数，添加优先类型逻辑
const handleSort = () => {
    if (!searchResults.value.length) return;

    // 先按照优先类型排序
    if (priorityType.value) {
        searchResults.value.sort((a, b) => {
            // 如果a是优先类型而b不是，a排在前面
            if (a.type === priorityType.value && b.type !== priorityType.value) {
                return -1;
            }
            // 如果b是优先类型而a不是，b排在前面
            if (b.type === priorityType.value && a.type !== priorityType.value) {
                return 1;
            }
            // 如果两者都是或都不是优先类型，按照其他条件排序
            return 0;
        });
    }

    // 然后在各自类型内部按照时间或浏览量排序
    searchResults.value.sort((a, b) => {
        // 如果两者优先级相同（都是优先类型或都不是优先类型）
        if ((a.type === priorityType.value) === (b.type === priorityType.value)) {
            if (sortBy.value === 'newest') {
                const dateA = new Date(a.uploadDate).getTime();
                const dateB = new Date(b.uploadDate).getTime();
                return dateB - dateA;
            } else if (sortBy.value === 'views') {
                return b.views - a.views;
            }
        }
        return 0;
    });
    
    // 如果当前页超出了总页数，重置到第一页
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = 1;
    }
};

// 添加用户设置相关变量
const userSettings = ref({
  pageSize: 20,
  defaultSort: 'time',
  priorityTypes: ['paper'],
  defaultSearchScopes: ['title', 'abstract', 'keywords'],
  defaultTimeRange: 'all'
});

// 修改初始化设置
onMounted(() => {
  // 加载用户设置
  loadUserSettings();
  
  // 监听设置更新事件
  window.addEventListener('searchSettingsUpdated', handleSettingsUpdated);
  
  // 原有的高级搜索参数处理
  const advancedParams = route.query.advanced;
//   console.log('advancedParams',advancedParams)
  if (advancedParams) {
    try {
      const params = JSON.parse(advancedParams);
      params.dateRange = params.dateRange?.map(dateStr => new Date(dateStr)) || [];
    //   console.log('接收到高级搜索参数:', params);
    //   console.log('searchType  :', params.searchType);
    //   console.log('types  :', params.types);
    //   handleAdvancedSearch(params);
    } catch (error) {
      console.error('解析高级搜索参数失败:', error);
    }
  }
});

// 在组件销毁前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('searchSettingsUpdated', handleSettingsUpdated);
});

// 加载用户设置
const loadUserSettings = () => {
  try {
    const savedSettings = localStorage.getItem('searchSettings');
    if (savedSettings) {
      userSettings.value = JSON.parse(savedSettings);
      
      // 应用设置到相应的变量
      applyUserSettings();
    }
  } catch (error) {
    console.error('加载用户设置失败:', error);
  }
};

// 处理设置更新事件
const handleSettingsUpdated = (event) => {
  userSettings.value = event.detail;
  
  // 应用更新后的设置
  applyUserSettings();
};

// 应用用户设置到搜索界面
const applyUserSettings = () => {
  // 设置每页显示数量
  pageSize.value = userSettings.value.pageSize;
  
  // 设置默认排序方式
  if (userSettings.value.defaultSort === 'time') {
    sortBy.value = 'newest';
  } else if (userSettings.value.defaultSort === 'citations') {
    sortBy.value = 'views';
  }
  
  // 设置优先显示的成果类型
  if (userSettings.value.priorityTypes && userSettings.value.priorityTypes.length > 0) {
    // 取第一个优先类型作为当前优先显示
    const priorityMap = {
      'paper': 'paper',
      'patent': 'patent',
      'standard': 'project',
      'software': 'report'
    };
    
    const firstPriorityType = userSettings.value.priorityTypes[0];
    priorityType.value = priorityMap[firstPriorityType] || '';
  }
  
  // 如果已有搜索结果，重新应用排序和分页
  if (searchResults.value.length > 0) {
    handleSort();
    currentPage.value = 1; // 重置到第一页
  }
  
};

const handleAdvancedSearch = async (params) => {
    console.log("高级搜索参数:", params);
  try {
    // 设置搜索类型
    searchType.value = params.searchType || 'fuzzy';
    
    // 构建搜索参数
    const searchBody = {
      keywords: [searchQuery.value],
      pageNum: 1,
      pageSize: 10,
      subjectCategorys: searchSubject.value,
      technologyCategorys: searchTechnology.value
    }
    // console.log("高级搜索参数:", searchBody);

    // 根据搜索类型选择API
    const apiMethod = searchType.value === 'exact' 
      ? preciseSearchAchievements 
      : fuzzySearchAchievements;

    // 执行搜索
    const response = await apiMethod(params);
    processSearchResults(response);
  } catch (error) {
    console.error('高级搜索失败:', error);
    searchResults.value = [];
  }
};

// 修改处理搜索结果的函数，添加优先类型标记
const processSearchResults = async (response) => {
    console.log("response_search", response);
    if (Array.isArray(response)){
        const filteredResults = response.filter(item => {
            const itemType = item.achievementCategory?.toLowerCase()
            if (!selectedTypes.value.length) return true
            return selectedTypes.value.includes(itemType)
        });

        // 获取所有成果的详细信息
        const detailedResults = await Promise.all(filteredResults.map(async item => {
            try {
                const detail = await queryById(item.achievementId);
                let projectName = item.projectId;
                // 如果projectId存在，尝试获取项目名称
                if (item.projectId) {
                    try {
                        const projectInfo = await getProjectById(item.projectId);
                        projectName = projectInfo.projectName || item.projectId;
                    } catch (error) {
                        console.error(`获取项目${item.projectId}信息失败:`, error);
                    }
                }
                return {
                    id: item.achievementId,
                    title: item.achievementName,
                    type: getTypeChineseName(item.achievementCategory?.toLowerCase()),
                    version: item.achievementVersion,
                    author: detail.userName || item.userName,
                    project: projectName,
                    organization: detail.organizationName || item.organizationName,
                    description: item.achievementIntro,
                    uploadDate: item.uploadTime?.substring(0, 10) || '',
                    views: item.achievementDownloadCount || 0,
                    isPriority: item.achievementCategory?.toLowerCase() === priorityType.value
                };
            } catch (error) {
                console.error(`获取成果${item.achievementId}详情失败:`, error);
                return {
                    id: item.achievementId,
                    title: item.achievementName,
                    type: getTypeChineseName(item.achievementCategory?.toLowerCase()),
                    version: item.achievementVersion,
                    author: item.userName,
                    project: item.projectId,
                    organization: item.organizationName,
                    description: item.achievementIntro,
                    uploadDate: item.uploadTime?.substring(0, 10) || '',
                    views: item.achievementDownloadCount || 0,
                    isPriority: item.achievementCategory?.toLowerCase() === priorityType.value
                };
            }
        }));
        
        searchResults.value = detailedResults;
        console.log("allResults 1", allResults.value);
        currentPage.value = 1;
        handleSort();
    }
};

// Add this helper function
const getTypeChineseName = (type) => {
    switch(type) {
        case 'technology': return '技术类成果';
        case 'system': return '系统类成果';
        case 'software': return '软件类成果';
        case 'hardware': return '硬件类成果';
        case 'paper': return '论文';
        case 'patent': return '专利';
        case 'project': return '科研项目';
        case 'report': return '技术报告';
        default: return type;
    }
};

// 搜索核心逻辑
const performSearch = async () => {
  try {
    isLoading.value = true;
    
    // 构建基础请求参数
 
    const searchBody = {
      keywords: [searchQuery.value], // 关键词
      pageNum: 1,
      pageSize: 10,
      subjectCategorys: searchSubject.value,
      technologyCategorys: searchTechnology.value,
       // 使用分类ID进行搜索
    }
    console.log('performSearch searchBody', searchBody)
    console.log('类型:', typeof searchBody.subjectCategorys)
    console.log('technologyCategorys:', typeof searchBody.technologyCategorys)
    console.log('准备发送搜索请求，searchBody:', searchBody)
    
    const response = await fuzzySearchAchievements(searchBody)
    console.log('搜索响应:', response)

    processSearchResults(response);
    
  } catch (error) {
    console.error('performSearch搜索失败:', error)
    searchResults.value = []
  } finally {
    isLoading.value = false;
  }
};

// 修改watchEffect部分
watchEffect(() => {
  if (route.query.advanced) {
    try {
      const params = JSON.parse(route.query.advanced);
      console.log("解析的高级搜索参数", params);
      const searchbody = {
            keyword: '', // 空关键词
            searchType: 'fuzzy',
            achievementCategories: params.achievementcategorytypes,// 使用分类名称
            dateRange: [],
            achievementBelongingOrganizations:params.organizations,
            
            path: []
        }
      // 给搜索框赋值
      selectedTypes.value = params.types || [];
      searchQuery.value = params.keyword || '';
      searchType.value = params.searchType || 'fuzzy';
      searchSubject.value = params.categorytypes || [];
      searchTechnology.value = params.technologytypes || [];

      // 自动触发高级搜索
      handleAdvancedSearch(searchbody);
    } catch (e) {
      console.error('参数解析失败:', e);
    }  
  }
});



const navigateToDetail = (item) => {
    console.log('导航到成果详情页:', item);
    // 将成果数据存储到本地存储，以便在详情页面获取
    localStorage.setItem('currentAchievement', JSON.stringify(item));
    // 导航到详情页，并传递成果ID作为参数
    router.push({
        path: '/home/achievementDetail',
        query: { 
            id: item.id,
            // 可以传递一些基本信息作为查询参数
            type: item.type
        }
    });
};

// Add this utility function to store download records
const storeDownloadRecord = (record) => {
    try {
        // Get existing records
        const existingRecords = JSON.parse(localStorage.getItem('downloadForms') || '[]');
        
        // Add new record
        existingRecords.push(record);
        
        // Save back to localStorage
        localStorage.setItem('downloadForms', JSON.stringify(existingRecords));
    } catch (error) {
        console.error('保存下载记录失败:', error);
    }
};

// 定时下载相关变量
const showScheduleDialog = ref(false);
const scheduledItems = ref([]);
const scheduledTime = ref('');
const minScheduleTime = computed(() => {
    const now = new Date();
    // 格式化为 datetime-local 输入所需的格式：YYYY-MM-DDThh:mm
    return new Date(now.getTime() + 60000).toISOString().slice(0, 16);
});

// 处理定时下载
const handleScheduleDownload = (item) => {
    scheduledItems.value = item ? [item] : 
        searchResults.value.filter(result => selectedItems.value.includes(result.id));
    
    // 设置默认时间为5分钟后
    const defaultTime = new Date();
    defaultTime.setMinutes(defaultTime.getMinutes() + 5);
    scheduledTime.value = defaultTime.toISOString().slice(0, 16);
    
    showScheduleDialog.value = true;
};

// 批量定时下载
const handleBatchScheduleDownload = () => {
    if (!selectedItems.value.length) {
        ElMessage.warning('请先选择要下载的项目');
        return;
    }
    
    scheduledItems.value = searchResults.value.filter(item => 
        selectedItems.value.includes(item.id)
    );
    
    // 设置默认时间为5分钟后
    const defaultTime = new Date();
    defaultTime.setMinutes(defaultTime.getMinutes() + 5);
    scheduledTime.value = defaultTime.toISOString().slice(0, 16);
    
    showScheduleDialog.value = true;
};

// 取消定时下载
const cancelScheduleDownload = () => {
    showScheduleDialog.value = false;
    scheduledItems.value = [];
};

// 确认定时下载 - 修改为使用 localStorage 存储
const confirmScheduleDownload = () => {
    if (!scheduledTime.value) {
        ElMessage.warning('请选择下载时间');
        return;
    }
    
    const scheduledTimeMs = new Date(scheduledTime.value).getTime();
    const now = Date.now();
    
    if (scheduledTimeMs <= now) {
        ElMessage.warning('请选择一个未来的时间');
        return;
    }
    
    // 准备要下载的项目数据
    const scheduleId = Date.now().toString();
    const scheduleData = {
        id: scheduleId,
        items: JSON.parse(JSON.stringify(scheduledItems.value)),
        scheduledTime: scheduledTime.value,
        isBatch: scheduledItems.value.length > 1,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    // 保存到 localStorage
    saveScheduleToStorage(scheduleData);
    
    // 关闭对话框并显示确认消息
    showScheduleDialog.value = false;
    ElMessage.success(`已安排下载任务于 ${new Date(scheduledTime.value).toLocaleString()}`);
};

// 本地存储操作函数
const saveScheduleToStorage = (scheduleData) => {
    try {
        const schedules = JSON.parse(localStorage.getItem('downloadSchedules') || '[]');
        schedules.push(scheduleData);
        localStorage.setItem('downloadSchedules', JSON.stringify(schedules));
    } catch (error) {
        console.error('保存定时下载任务失败:', error);
    }
};

// 检查是否有到期的下载任务
const checkScheduledDownloads = () => {
    try {
        const now = new Date();
        const schedules = JSON.parse(localStorage.getItem('downloadSchedules') || '[]');
        let needUpdate = false;
        
        schedules.forEach(schedule => {
            if (schedule.status === 'pending') {
                const scheduledTime = new Date(schedule.scheduledTime);
                
                if (scheduledTime <= now) {
                    // 标记为处理中
                    schedule.status = 'processing';
                    needUpdate = true;
                    
                    // 执行下载
                    executeScheduledDownload(schedule);
                }
            }
        });
        
        if (needUpdate) {
            localStorage.setItem('downloadSchedules', JSON.stringify(schedules));
        }
    } catch (error) {
        console.error('检查定时下载任务失败:', error);
    }
};

// 执行定时下载任务
const executeScheduledDownload = async (schedule) => {
    try {
        if (schedule.isBatch) {
            // 批量下载
            downloadItems.value = schedule.items;
            currentDownloadType.value = 'batch';
            await downloadFiles(false);
            ElMessage.success(`定时批量下载任务已执行: ${schedule.items.length} 个文件`);
        } else if (schedule.items.length === 1) {
            // 单个文件下载
            await handleSave(schedule.items[0]);
            ElMessage.success(`定时下载任务已执行: ${schedule.items[0].title}`);
        }
        
        // 更新状态为已完成
        updateScheduleStatus(schedule.id, 'completed');
    } catch (error) {
        console.error('执行定时下载任务失败:', error);
        ElMessage.error('定时下载任务执行失败，请稍后重试');
        
        // 更新状态为失败
        updateScheduleStatus(schedule.id, 'failed');
    }
};

// 更新下载任务状态
const updateScheduleStatus = (scheduleId, status) => {
    try {
        const schedules = JSON.parse(localStorage.getItem('downloadSchedules') || '[]');
        
        const updatedSchedules = schedules.map(schedule => {
            if (schedule.id === scheduleId) {
                return { ...schedule, status };
            }
            return schedule;
        });
        
        localStorage.setItem('downloadSchedules', JSON.stringify(updatedSchedules));
    } catch (error) {
        console.error('更新定时下载任务状态失败:', error);
    }
};

// 设置定时器检查间隔
let checkInterval = null;

// 在组件挂载时开始检查定时任务
onMounted(() => {
    // 立即检查一次
    checkScheduledDownloads();
    
    // 设置定期检查
    checkInterval = setInterval(() => {
        checkScheduledDownloads();
    }, 30000); // 每30秒检查一次
    
    // 添加页面卸载前的事件处理
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 如果是第一次加载，启动全局定时器
    if (!localStorage.getItem('timerStarted')) {
        startGlobalTimer();
    }
    
    // 其他现有的 onMounted 代码...
});

// 组件卸载时的清理工作
onBeforeUnmount(() => {
    // 清除定时器
    if (checkInterval) {
        clearInterval(checkInterval);
    }
    
    // 移除事件监听器
    window.removeEventListener('beforeunload', handleBeforeUnload);
});

// 页面卸载前处理函数
const handleBeforeUnload = () => {
    // 确保定时器在下一次页面加载时重启
    localStorage.setItem('timerStarted', 'false');
};

// 启动全局定时器（在页面层面）
const startGlobalTimer = () => {
    // 设置一个标志
    localStorage.setItem('timerStarted', 'true');
    
    // 创建一个 worker，保持定期运行即使页面不活跃
    const timerWorker = `
        setInterval(() => {
            postMessage('check');
        }, 30000);
    `;
    
    const blob = new Blob([timerWorker], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    try {
        const worker = new Worker(workerUrl);
        
        worker.onmessage = (e) => {
            if (e.data === 'check') {
                checkScheduledDownloads();
            }
        };
        
        // 保存worker引用到window对象，防止被垃圾回收
        window.downloadCheckWorker = worker;
    } catch (error) {
        console.error('创建定时器worker失败:', error);
        
        // 回退方案：使用页面可见性API
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                checkScheduledDownloads();
            }
        });
    }
};
</script>

<style scoped>
.search-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
}

.search-header {
    margin-bottom: 30px;
}

.search-box {
    position: relative;
    display: flex;
    max-width: 800px;
    margin: 0 auto;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background: white;
}

.search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
}

.search-input {
    flex: 1;
    padding: 16px 16px 16px 45px;
    border: 2px solid transparent;
    border-radius: 8px 0 0 8px;
    font-size: 16px;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #4a90e2;
}

.search-button {
    padding: 0 30px;
    background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
    color: white;
    border: none;
    border-radius: 0 8px 8px 0;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.search-button:hover {
    background: linear-gradient(135deg, #357abd 0%, #2868a9 100%);
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 30px 0;
    padding: 0 10px;
}

.result-count {
    color: #666;
    font-size: 15px;
}

.sort-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sort-label {
    color: #666;
    font-size: 15px;
}

.sort-select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    color: #333;
    cursor: pointer;
    transition: all 0.3s ease;
}

.sort-select:hover {
    border-color: #4a90e2;
}

.result-item {
    padding: 20px;
    background: white;
    border-radius: 8px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;
}

.result-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-title {
    color: #2c3e50;
    margin: 0 0 10px 0;
    font-size: 18px;
}

.item-description {
    color: #666;
    margin: 0 0 15px 0;
    line-height: 1.5;
}

.item-meta {
    display: flex;
    gap: 20px;
    color: #888;
    font-size: 14px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.meta-item i {
    font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .search-container {
        padding: 20px 10px;
    }

    .search-box {
        flex-direction: column;
        box-shadow: none;
    }

    .search-input {
        border-radius: 8px;
        margin-bottom: 10px;
        border: 2px solid #ddd;
    }

    .search-button {
        border-radius: 8px;
        padding: 12px;
    }

    .result-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
    }
}

.main-content {
    display: flex;
    gap: 30px;
    margin-top: 30px;
    flex-wrap: wrap;
}

.filter-sidebar {
    width: 250px;
    flex-shrink: 0;
}

.filter-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-section h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #333;
}

.filter-item {
    margin: 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.results-area {
    flex: 1;
    min-width: 0;
}

.item-checkbox {
    padding: 20px 10px;
}

.result-item {
    display: flex;
}

.item-content {
    flex: 1;
}

.item-info {
    display: flex;
    gap: 20px;
    margin: 10px 0;
    color: #666;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 5px;
}

.item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
}

.item-actions {
    display: flex;
    gap: 10px;
}

.action-btn {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
}

.action-btn:hover {
    border-color: #4a90e2;
    color: #4a90e2;
}

.action-btn.download {
    color: #4a90e2;
}

.batch-download-btn {
    padding: 8px 16px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 15px;
}

.left-actions {
    display: flex;
    align-items: center;
}

/* 响应式调整 */
@media (max-width: 1024px) {
    .main-content {
        flex-direction: column;
    }

    .filter-sidebar {
        width: 100%;
    }
}

.results-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-header {
    display: grid;
    grid-template-columns: 50px 2fr 80px 80px 1fr 1.5fr 1.5fr 120px;
    padding: 15px;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
    font-weight: 600;
    color: #333;
    border-radius: 8px 8px 0 0;
}

.table-row {
    display: grid;
    grid-template-columns: 50px 2fr 80px 80px 1fr 1.5fr 1.5fr 120px;
    padding: 15px;
    border-bottom: 1px solid #eee;
    align-items: center;
}

.table-row:hover {
    background: #f8f9fa;
}

.column-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
}

.column-title .title-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.column-title h3 {
    margin: 0;
    font-size: 16px;
    color: #2c3e50;
}

.description {
    font-size: 14px;
    color: #666;
    margin: 0;
}

.meta-info {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: #888;
}

.column-author,
.column-project,
.column-org {
    padding: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.column-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.action-btn {
    padding: 4px 8px;
    font-size: 12px;
}

/* 响应式调整 */
@media (max-width: 1024px) {
    .table-header,
    .table-row {
        grid-template-columns: 50px 2fr 80px 80px 1fr 1fr 1fr 120px;
    }
}

@media (max-width: 768px) {
    .results-table {
        overflow-x: auto;
    }
    
    .table-header,
    .table-row {
        min-width: 900px;
    }
}

/* 添加优先类型的样式 */
.priority-result {
    border-left: 3px solid #4a90e2;
    background-color: #f8f9fa;
}

.column-type {
    padding: 0 10px;
}

.type-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    background-color: #e9ecef;
    color: #495057;
    font-size: 12px;
}

.loading-indicator {
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state img {
  width: 200px;
  opacity: 0.8;
  margin-bottom: 20px;
}

.empty-state p {
  color: #999;
  font-size: 16px;
}

/* 分页样式 */
.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    gap: 5px;
    width: 100%; /* 确保宽度占满 */
    order: 3; /* 确保它在筛选栏和结果区域之后 */
}

.pagination-btn {
    width: 40px;
    height: 40px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
    border-color: #4a90e2;
    color: #4a90e2;
}

.pagination-btn.active {
    background: #4a90e2;
    color: white;
    border-color: #4a90e2;
}

.pagination-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.ml-15 {
    margin-left: 15px;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .pagination-container {
        flex-wrap: wrap;
    }
    
    .sort-container {
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .ml-15 {
        margin-left: 0;
    }
}

/* 添加可点击标题的样式 */
.clickable-title {
  cursor: pointer;
  color: #2c3e50;
  transition: color 0.2s ease;
}

.clickable-title:hover {
  color: #4a90e2;
  text-decoration: underline;
}

/* 下载对话框样式 */
.download-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.download-dialog {
    background: white;
    border-radius: 12px;
    width: 500px;
    max-width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    animation: dialog-fade-in 0.3s ease;
}

@keyframes dialog-fade-in {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
}

.dialog-header h3 {
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
}

.close-btn {
    background: transparent;
    border: none;
    font-size: 18px;
    color: #999;
    cursor: pointer;
    transition: color 0.2s ease;
}

.close-btn:hover {
    color: #333;
}

.dialog-content {
    padding: 20px;
    max-height: 300px;
    overflow-y: auto;
}

.dialog-content p {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #333;
}

.highlight {
    font-weight: bold;
    color: #4a90e2;
}

.download-path {
    display: flex;
    margin-bottom: 20px;
}

.path-input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px 0 0 6px;
    font-size: 14px;
    background: #f9f9f9;
}

.browse-btn {
    padding: 10px 15px;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-left: none;
    border-radius: 0 6px 6px 0;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 5px;
}

.browse-btn:hover {
    background: #e5e5e5;
}

.file-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 10px;
    background: #f9f9f9;
}

.file-list h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #666;
}

.file-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    color: #333;
}

.file-item:last-child {
    border-bottom: none;
}

.file-item i {
    color: #4a90e2;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid #eee;
}

.cancel-btn {
    padding: 10px 16px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    color: #666;
}

.cancel-btn:hover {
    background: #f5f5f5;
}

.confirm-btn {
    padding: 10px 16px;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.confirm-btn:hover {
    background: #357abd;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .download-dialog {
        width: 95%;
    }
    
    .download-path {
        flex-direction: column;
    }
    
    .path-input {
        border-radius: 6px;
        margin-bottom: 10px;
    }
    
    .browse-btn {
        border-radius: 6px;
        border-left: 1px solid #ddd;
    }
}

/* 添加版本列的样式 */
.column-version {
    padding: 0 10px;
    text-align: center;
    color: #666;
    font-size: 14px;
}

/* 下载对话框样式 - 添加新按钮的样式 */
.action-buttons {
    display: flex;
    gap: 10px;
}

.action-btn {
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.save-btn {
    background: #4a90e2;
    color: white;
    border: none;
}

.save-btn:hover {
    background: #357abd;
}

.save-as-btn {
    background: #28a745;
    color: white;
    border: none;
}

.save-as-btn:hover {
    background: #218838;
}

.open-btn {
    background: #fd7e14;
    color: white;
    border: none;
}

.open-btn:hover {
    background: #e86c0a;
}

/* 使对话框内容区域更高一些，以容纳文件列表 */
.dialog-content {
    padding: 20px;
    max-height: 300px;
    overflow-y: auto;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .action-buttons {
        flex-direction: column;
    }
}

/* Add KG container styles */
.kg-container {
    margin-top: 40px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 定时下载按钮样式 */
.action-btn.schedule {
    background-color: #ffc107;
    color: #212529;
    border: none;
}

.action-btn.schedule:hover {
    background-color: #e0a800;
}

.batch-schedule-btn {
    padding: 8px 16px;
    background: #ffc107;
    color: #212529;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 10px;
}

.batch-schedule-btn:hover {
    background-color: #e0a800;
}

/* 定时选择器样式 */
.schedule-options {
    margin: 20px 0;
}

.schedule-option {
    margin-bottom: 15px;
}

.schedule-option label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
}

.schedule-time-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.schedule-time-input:focus {
    outline: none;
    border-color: #4a90e2;
}
</style>


//当前版本完成了设置的显示数量、排序方式、优先显示类型，其他未进行设置
//完成了搜索和后端的连接,searchbody的构建，但没有实现下载
//searchbody全部完成。按成果类别查询成功,
//下载功能完成，但存在提示问题

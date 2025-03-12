<template>
  <div class="quality-check">
    <h2 class="title">质量检查</h2>

    <div class="check-content">
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="文件完整性检查"></el-step>
        <el-step title="格式规范检查"></el-step>
        <el-step title="内容质量检查"></el-step>
      </el-steps>

      <div class="check-result" v-loading="checking">
        <div v-if="!checking && checkResults.length > 0">
          <el-table :data="checkResults" style="width: 100%; margin-top: 20px;">
            <el-table-column prop="item" label="检查项"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'pass' ? 'success' : 'danger'">
                  {{ scope.row.status === 'pass' ? '通过' : '未通过' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="说明"></el-table-column>
          </el-table>
        </div>

        <div class="summary" v-if="!checking && checkComplete">
          <div v-if="!allPassed" class="error-summary">
            <el-alert
              title="检查未通过，请修正以下问题："
              type="error"
              :closable="false"
              show-icon
            >
              <div class="error-list">
                <ul>
                  <li v-for="item in failedItems" :key="item.item">
                    {{ item.item }}: {{ item.message }}
                  </li>
                </ul>
              </div>
            </el-alert>
          </div>

          <div v-else class="preview-summary">
            <el-alert
              title="检查通过！以下是您的成果信息预览："
              type="success"
              :closable="false"
              show-icon
            />
            
            <el-card class="preview-card">
              <template #header>
                <div class="preview-header">
                  <span>成果信息预览</span>
                  <el-tag type="success">已通过检查</el-tag>
                </div>
              </template>
              
              <div class="preview-content">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="成果名称">
                    {{ basicInfo.title }}
                  </el-descriptions-item>
                  <el-descriptions-item label="成果类型">
                    {{ getAchievementTypeLabel(basicInfo.type) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="发布时间">
                    {{ formatDate(basicInfo.publishDate) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="文件数量">
                    {{ basicInfo.fileCount }}
                  </el-descriptions-item>
                  <el-descriptions-item label="作者信息" :span="2">
                    <el-tag 
                      v-for="(author, index) in basicInfo.authors" 
                      :key="index"
                      class="author-tag"
                    >
                      {{ author.name }} ({{ author.affiliation }})
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="关键词" :span="2">
                    <el-tag 
                      v-for="keyword in basicInfo.keywords" 
                      :key="keyword"
                      class="keyword-tag"
                    >
                      {{ keyword }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="成果简介" :span="2">
                    {{ basicInfo.description }}
                  </el-descriptions-item>
                </el-descriptions>

                <div class="files-preview">
                  <h4>已上传文件</h4>
                  <el-table :data="uploadedFiles" size="small">
                    <el-table-column prop="name" label="文件名" />
                    <el-table-column prop="type" label="类型" width="120">
                      <template #default="{ row }">
                        {{ getFileTypeLabel(row.type) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="size" label="大小" width="100" />
                  </el-table>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <el-button @click="prevStep">上一步</el-button>
      <el-button type="primary" @click="startCheck" :disabled="checking">
        开始检查
      </el-button>
      <el-button 
        type="success" 
        @click="submitAll" 
        :disabled="!checkComplete || !allPassed"
      >
        提交发布
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QualityCheck',
  data() {
    return {
      activeStep: 0,
      checking: false,
      checkComplete: false,
      checkResults: [],
      allPassed: false,
      basicInfo: null,
      uploadedFiles: null
    }
  },
  mounted() {
    // 加载基本信息和上传文件数据
    this.loadSavedData()
  },
  computed: {
    failedItems() {
      return this.checkResults.filter(item => item.status === 'fail')
    }
  },
  methods: {
    loadSavedData() {
      try {
        this.basicInfo = JSON.parse(localStorage.getItem('Ach_info') || '{}')
        this.uploadedFiles = JSON.parse(localStorage.getItem('Upload') || '[]')
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败')
      }
    },

    async startCheck() {
      this.checking = true
      this.checkComplete = false
      this.checkResults = []
      this.activeStep = 0

      // 执行实际检查
      await this.performFileCheck()
      await this.performFormatCheck()
      await this.performContentCheck()

      this.checking = false
      this.checkComplete = true
      this.calculateFinalResult()
    },

    async performFileCheck() {
      await this.simulateCheck()
      
      // 检查文件数量是否匹配
      const expectedCount = this.basicInfo.fileCount || 0
      const actualCount = this.uploadedFiles.length
      
      this.checkResults.push({
        item: '文件数量检查',
        status: expectedCount === actualCount ? 'pass' : 'fail',
        message: expectedCount === actualCount 
          ? `文件数量符合要求：${actualCount}个` 
          : `文件数量不匹配：预期${expectedCount}个，实际${actualCount}个`
      })

      // 检查文件完整性
      const hasInvalidFiles = this.uploadedFiles.some(file => 
        file.status !== 'success' || file.progress !== 100
      )
      
      this.checkResults.push({
        item: '文件完整性检查',
        status: !hasInvalidFiles ? 'pass' : 'fail',
        message: !hasInvalidFiles 
          ? '所有文件上传完整' 
          : '存在未完成或失败的文件上传'
      })
      
      this.activeStep = 1
    },

    async performFormatCheck() {
      await this.simulateCheck()
      
      // 检查文件类型是否符合成果类型要求
      const achievementType = this.basicInfo.type
      const fileTypes = this.uploadedFiles.map(f => f.type)
      
      let typeCheckPassed = true
      let typeMessage = ''
      
      switch(achievementType) {
        case 'paper':
          typeCheckPassed = fileTypes.some(t => t.includes('pdf') || t.includes('doc'))
          typeMessage = typeCheckPassed 
            ? '文件格式符合论文要求' 
            : '缺少必要的论文文档文件'
          break
        case 'patent':
          // 添加专利特定的检查逻辑
          break
        // 添加其他成果类型的检查...
      }
      
      this.checkResults.push({
        item: '文件格式检查',
        status: typeCheckPassed ? 'pass' : 'fail',
        message: typeMessage
      })
      
      this.activeStep = 2
    },

    async performContentCheck() {
      await this.simulateCheck()
      
      // 检查基本信息完整性
      const requiredFields = ['title', 'type', 'publishDate', 'description']
      const missingFields = requiredFields.filter(field => !this.basicInfo[field])
      
      this.checkResults.push({
        item: '基本信息完整性',
        status: missingFields.length === 0 ? 'pass' : 'fail',
        message: missingFields.length === 0 
          ? '基本信息填写完整' 
          : `缺少必要信息：${missingFields.join(', ')}`
      })

      // 检查作者信息
      const hasValidAuthors = this.basicInfo.authors?.length > 0 && 
        this.basicInfo.authors.every(a => a.name && a.affiliation)
      
      this.checkResults.push({
        item: '作者信息检查',
        status: hasValidAuthors ? 'pass' : 'fail',
        message: hasValidAuthors 
          ? '作者信息完整' 
          : '作者信息不完整或缺失'
      })
      
      this.activeStep = 3
    },

    simulateCheck() {
      // 模拟异步检查过程
      return new Promise(resolve => setTimeout(resolve, 1000))
    },

    calculateFinalResult() {
      this.allPassed = this.checkResults.every(item => item.status === 'pass')
    },

    prevStep() {
      this.$router.push('/publish/upload')
    },

    async submitAll() {
      try {
        // 获取之前步骤保存的数据
        const basicInfo = JSON.parse(localStorage.getItem('basicInfo') || '{}')
        const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')

        // 这里添加提交所有数据的逻辑
        const submitData = {
          basicInfo,
          files: uploadedFiles,
          checkResults: this.checkResults
        }

        // 模拟提交
        await this.simulateSubmit(submitData)

        this.$message.success('提交成功！')
        // 清除本地存储的数据
        localStorage.removeItem('basicInfo')
        localStorage.removeItem('uploadedFiles')
        // 跳转到首页或其他页面
        this.$router.push('/home')
      } catch (error) {
        this.$message.error('提交失败：' + error.message)
      }
    },

    simulateSubmit(data) {
      // 模拟提交到服务器的过程
      return new Promise(resolve => setTimeout(resolve, 1500))
    },

    getAchievementTypeLabel(type) {
      const typeMap = {
        'paper': '学术论文',
        'patent': '专利',
        'project': '科研项目',
        'report': '技术报告'
      }
      return typeMap[type] || type
    },

    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },

    getFileTypeLabel(type) {
      if (type.includes('pdf')) return 'PDF文档'
      if (type.includes('doc')) return 'Word文档'
      if (type.includes('image')) return '图片'
      if (type.includes('video')) return '视频'
      return '其他'
    }
  }
}
</script>

<style scoped>
.quality-check {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.title {
  margin-bottom: 30px;
  text-align: center;
}

.check-content {
  margin: 30px 0;
}

.check-result {
  margin-top: 30px;
  min-height: 200px;
}

.summary {
  margin-top: 20px;
}

.action-buttons {
  margin-top: 30px;
  text-align: right;
}

.action-buttons .el-button {
  margin-left: 10px;
}

.preview-card {
  margin-top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-content {
  margin-top: 20px;
}

.author-tag {
  margin-right: 10px;
  margin-bottom: 5px;
}

.keyword-tag {
  margin-right: 8px;
  margin-bottom: 5px;
}

.error-list {
  margin-top: 10px;
  padding-left: 20px;
}

.error-list ul {
  margin: 0;
  padding-left: 20px;
}

.error-list li {
  color: #f56c6c;
  margin-bottom: 5px;
}

.files-preview {
  margin-top: 20px;
}

.files-preview h4 {
  margin-bottom: 15px;
  color: #606266;
}
</style>
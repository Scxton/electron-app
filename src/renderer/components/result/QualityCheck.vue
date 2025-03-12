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
          <el-alert
            :title="allPassed ? '检查完成：所有项目均通过' : '检查完成：存在未通过项'"
            :type="allPassed ? 'success' : 'warning'"
            :closable="false"
            show-icon
          >
          </el-alert>
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
      allPassed: false
    }
  },
  methods: {
    async startCheck() {
      this.checking = true
      this.checkComplete = false
      this.checkResults = []
      this.activeStep = 0

      // 模拟检查过程
      await this.performFileCheck()
      await this.performFormatCheck()
      await this.performContentCheck()

      this.checking = false
      this.checkComplete = true
      this.calculateFinalResult()
    },

    async performFileCheck() {
      await this.simulateCheck()
      this.checkResults.push({
        item: '文件完整性检查',
        status: 'pass',
        message: '所有文件完整性验证通过'
      })
      this.activeStep = 1
    },

    async performFormatCheck() {
      await this.simulateCheck()
      this.checkResults.push({
        item: '文件命名规范',
        status: 'pass',
        message: '文件命名符合规范要求'
      })
      this.checkResults.push({
        item: '文件格式检查',
        status: 'pass',
        message: '文件格式符合要求'
      })
      this.activeStep = 2
    },

    async performContentCheck() {
      await this.simulateCheck()
      this.checkResults.push({
        item: '内容规范性检查',
        status: 'pass',
        message: '内容符合规范要求'
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
</style>
<template>
  <div class="basic-info">
    <h2 class="title">基本信息</h2>
    
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="成果名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入成果名称"></el-input>
      </el-form-item>
      
      <el-form-item label="成果类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择成果类型">
          <el-option label="软件" value="software"></el-option>
          <el-option label="文档" value="document"></el-option>
          <el-option label="其他" value="other"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          rows="4"
          placeholder="请输入成果描述"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="版本号" prop="version">
        <el-input v-model="formData.version" placeholder="请输入版本号"></el-input>
      </el-form-item>
    </el-form>

    <div class="action-buttons">
      <el-button type="primary" @click="nextStep">下一步</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BasicInfo',
  data() {
    return {
      formData: {
        name: '',
        type: '',
        description: '',
        version: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入成果名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择成果类型', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入成果描述', trigger: 'blur' }
        ],
        version: [
          { required: true, message: '请输入版本号', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    nextStep() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          // 保存表单数据到 store 或 localStorage
          localStorage.setItem('basicInfo', JSON.stringify(this.formData))
          // 跳转到下一步
          this.$router.push('/publish/upload')
        }
      })
    }
  },
  created() {
    // 尝试恢复之前保存的数据
    const savedData = localStorage.getItem('basicInfo')
    if (savedData) {
      this.formData = JSON.parse(savedData)
    }
  }
}
</script>

<style scoped>
.basic-info {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.title {
  margin-bottom: 30px;
  text-align: center;
}

.action-buttons {
  margin-top: 30px;
  text-align: right;
}
</style>
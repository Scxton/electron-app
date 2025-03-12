<template>
  <div class="template-selection">
    <!-- 模板分类选择 -->
    <div class="category-section">
      <h2>选择模板类别</h2>
      <el-radio-group v-model="selectedCategory">
        <el-radio-button v-for="category in categories" 
          :key="category.id" 
          :label="category.id">
          {{ category.name }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 模板列表 -->
    <div class="templates-grid">
      <el-card v-for="template in filteredTemplates" 
        :key="template.id"
        :class="{ 'selected': selectedTemplate === template }"
        @click="selectTemplate(template)">
        <div class="template-card">
          <img :src="template.thumbnail" alt="模板预览图">
          <h3>{{ template.name }}</h3>
          <p>{{ template.description }}</p>
        </div>
      </el-card>
    </div>

    <!-- 预览区域 -->
    <div class="preview-section" v-if="selectedTemplate">
      <h2>预览</h2>
      <el-card class="preview-card">
        <div class="template-preview">
          <h3>{{ selectedTemplate.name }}</h3>
          <div class="preview-content" v-html="previewContent"></div>
        </div>
      </el-card>
    </div>

    <!-- 导航按钮 -->
    <div class="navigation-buttons">
      <el-button @click="previousStep">上一步</el-button>
      <el-button type="primary" 
        @click="nextStep" 
        :disabled="!selectedTemplate">
        下一步
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TemplateSelection',
  data() {
    return {
      categories: [
        { id: 'patent', name: '专利' },
        { id: 'paper', name: '论文' },
        { id: 'report', name: '报告' }
      ],
      selectedCategory: 'patent',
      selectedTemplate: null,
      templates: [
        {
          id: 1,
          categoryId: 'patent',
          name: '发明专利模板',
          description: '适用于发明专利申请',
          thumbnail: 'path/to/thumbnail1.jpg'
        },
        // 添加更多模板...
      ]
    }
  },
  computed: {
    filteredTemplates() {
      return this.templates.filter(template => 
        template.categoryId === this.selectedCategory
      )
    },
    previewContent() {
      if (!this.selectedTemplate) return ''
      // 这里可以结合实际成果信息生成预览内容
      return `预览内容将根据选择的模板和成果信息动态生成`
    }
  },
  methods: {
    selectTemplate(template) {
      this.selectedTemplate = template
    },
    previousStep() {
      this.$emit('previous-step')
    },
    nextStep() {
      if (this.selectedTemplate) {
        this.$emit('next-step', this.selectedTemplate)
      }
    }
  }
}
</script>

<style scoped>
.template-selection {
  padding: 20px;
}

.category-section {
  margin-bottom: 30px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.template-card {
  cursor: pointer;
}

.template-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.selected {
  border: 2px solid #409EFF;
}

.preview-section {
  margin-bottom: 30px;
}

.preview-card {
  min-height: 300px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
}
</style>

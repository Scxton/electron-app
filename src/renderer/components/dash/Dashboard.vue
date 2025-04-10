<template>
  <div class="container">
    <div class="top-section">
    </div>
    <div class="tree">
    <TreeChart :json="treeData" :horizontal="false">
      <!-- 自定义节点名称部分 -->
      <template #node-label="{ node }">
        <ElTooltip :content="node.tooltip" placement="top">
          <span
            style="cursor: pointer; display: flex; align-items: center; gap: 6px;"
            @click="handleClick(node)"
          >
            <!-- 图标 -->
            <span>{{ node.icon }}</span>
            <!-- 名称 -->
            <span style="color: #409EFF; text-decoration: underline;">{{ node.name }}</span>
            <!-- 状态圆点 -->
            <span
              :style="{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(node.status)
              }"
            ></span>
          </span>
        </ElTooltip>
      </template>
    </TreeChart>

    <!-- 弹窗详情 -->
    <ElDialog v-model="showDialog" title="节点详情" width="400px">
      <div v-if="selectedNode">
        <p><strong>名称：</strong>{{ selectedNode.name }}</p>
        <p><strong>职位：</strong>{{ selectedNode.tooltip }}</p>
        <p><strong>状态：</strong>{{ selectedNode.status }}</p>
        <p><strong>图标：</strong>{{ selectedNode.icon }}</p>
        <p><strong>图片链接：</strong> <a :href="selectedNode.image_url" target="_blank">{{ selectedNode.image_url }}</a></p>
      </div>
    </ElDialog>
  </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElDialog, ElTooltip } from 'element-plus'
import TreeChart from 'vue-tree-chart-3'
import { Menu } from '@element-plus/icons-vue'

// 选中的节点数据
const selectedNode = ref(null)
const showDialog = ref(false)

// 树形结构数据（含图标/状态/提示）
const treeData = ref({
  name: '软件化雷达',
  path: '/home',
  icon: Menu,
  children: [
    {
      name: '项目1',
      image_url: "https://static.refined-x.com/avat1.jpg",
      icon: '🧑‍💻',
      path: '/home/dash',
    },
    {
      name: '项目2',
      image_url: "https://static.refined-x.com/avat2.jpg",
      icon: '👨‍🔧',
      children: [
        {
          name: '课题1',
          image_url: "https://static.refined-x.com/avat.jpg",
          icon: '🧪',
          children: [
            {
              name: '子课题1',
              image_url: "https://static.refined-x.com/avat2.jpg",
              icon: '🧪'
            },
            {
              name: '子课题2',
              image_url: "https://static.refined-x.com/avat1.jpg",
              icon: '🧪'
            },
            {
              name: '子课题3',
              image_url: "https://static.refined-x.com/avat2.jpg",
              icon: '🧪'
            }
          ]
        },
        {
          name: '课题2',
          image_url: "https://static.refined-x.com/avat1.jpg",
          icon: '🧪'
        },
        {
          name: '课题3',
          image_url: "https://static.refined-x.com/avat2.jpg",
          icon: '🧪',
          children: [
            {
              name: '子课题1',
              image_url: "https://static.refined-x.com/avat1.jpg",
              icon: '🧪'
            },
            {
              name: '子课题2',
              image_url: "https://static.refined-x.com/avat2.jpg",
              icon: '🧪'
            }
          ]
        }
      ]
    },
    {
      name: '项目3',
      image_url: "https://static.refined-x.com/avat1.jpg",
      icon: '🧑‍💻'
    },
  ]
})

// 节点点击逻辑
const handleClick = (node) => {
  selectedNode.value = node
  showDialog.value = true
}

// 状态颜色映射
const getStatusColor = (status) => {
  switch (status) {
    case 'online':
      return 'green'
    case 'offline':
      return 'gray'
    case 'busy':
      return 'red'
    default:
      return 'lightgray'
  }
}
</script>


<style scoped>
.container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top-section {
  height: 320px;
  /* background-color: rgb(251, 239, 201); */
  background-image: url('../../assets/radar-bg-1.jpg'); /* 替换图片路径 */
  background-size: cover;  /* 让图片自适应缩放，填充整个区域 */
  background-position: center; /* 图片居中 */
  background-repeat: no-repeat; /* 防止图片重复 */
}

.tree{
  width: 100%;
  height: calc(100vh - 300px); /* 你上方有横幅，可以根据实际调整 */
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: start;
  padding: 20px 0;
}
</style>
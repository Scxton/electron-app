<template>
  <div class="knowledge-graph-container">
    <!-- 搜索功能区域 -->
    <div class="search-container">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="handleSearchInput"
          placeholder="搜索成果名称、作者或单位..." 
          class="search-input"
        />
        <button @click="performSearch" class="search-btn">
          <span class="search-icon">🔍</span>
        </button>
      </div>
      
      <!-- 搜索结果显示区 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <div 
          v-for="result in searchResults" 
          :key="result.id" 
          @click="focusOnNode(result)"
          class="search-result-item"
        >
          <div class="result-title">{{ result.name }}</div>
          <div class="result-meta">
            <span class="result-type">{{ result.category }}</span>
            <span class="result-author">{{ result.author }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 关联条件选择区域 -->
    <div class="filter-container">
      <h3>关联条件选择</h3>
      <div class="filter-options">
        <label v-for="(option, index) in relationOptions" :key="index" class="filter-option">
          <input type="checkbox" 
                 :value="option.value" 
                 v-model="selectedRelations"
                 @change="updateGraphByRelations">
          {{ option.label }}
        </label>
      </div>
      <div class="filter-buttons">
        <button @click="selectAllRelations" class="filter-btn">全选</button>
        <button @click="clearAllRelations" class="filter-btn">清除</button>
        <button @click="resetGraph" class="filter-btn primary">重置图谱</button>
      </div>
    </div>
    
    <div ref="chartRef" class="chart-container"></div>
    
    <!-- 节点信息弹窗 -->
    <div v-if="selectedNode" class="node-info-popup">
      <div class="popup-header">
        <h3>{{ selectedNode.name }}</h3>
        <button @click="closeNodeInfo" class="close-btn">×</button>
      </div>
      <div class="popup-content">
        <p><strong>类型:</strong> {{ selectedNode.category }}</p>
        <p><strong>发布日期:</strong> {{ selectedNode.date }}</p>
        <p><strong>版本信息:</strong> {{ selectedNode.version }}</p>
        <p><strong>来源项目:</strong> {{ selectedNode.project }}</p>
        <p v-if="selectedNode.author"><strong>作者:</strong> {{ selectedNode.author }}</p>
        <p v-if="selectedNode.institution"><strong>单位:</strong> {{ selectedNode.institution }}</p>
        <div class="popup-actions">
          <button @click="showRelatedGraph(selectedNode)" class="action-btn">查看关联图谱</button>
        </div>
      </div>
    </div>
  </div>
</template>
   
<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import * as echarts from 'echarts';
import { getKnowledgeGraph } from '../../api/search'; // Import the API function

// 图表DOM引用
const chartRef = ref(null);
let chart = null;

// 选中的节点信息
const selectedNode = ref(null);

// 搜索相关
const searchQuery = ref('');
const searchResults = ref([]);
const searchTimeout = ref(null);

// 关联条件选项
const relationOptions = [
  { label: '同一作者', value: '同一作者' },
  { label: '同一单位', value: '同一单位' },
  { label: '同一项目', value: '同一项目' },
  { label: '引用关系', value: '引用关系' }
];

// 选中的关联条件
const selectedRelations = ref(['同一作者', '同一单位', '同一项目', '引用关系']);

// 图谱显示模式：'all' - 显示所有节点, 'focused' - 显示特定节点及关联
const displayMode = ref('all');
const focusedNodeId = ref(null);

// 原始数据（保存完整数据用于筛选）
const originalData = ref({
  nodes: [],
  links: []
});

// 当前显示的数据
const currentData = ref({
  nodes: [],
  links: []
});

// 类别（用于颜色区分）
const categories = ref([
  { name: '论文' },
  { name: '专利' },
  { name: '软件' }
]);

// 加载状态
const loading = ref(false);

// 获取知识图谱数据
const fetchKnowledgeGraphData = async () => {
  loading.value = true;
  try {
    const response = await getKnowledgeGraph();
    console.log('get  response[0]',response[0][2]);
    if (Array.isArray(response) && response.length > 0) {
      // 处理后端返回的数据
      const graphData = processGraphData(response);
      originalData.value = graphData;
      currentData.value = {
        nodes: [...graphData.nodes],
        links: [...graphData.links]
      };
      
      // 更新类别
      updateCategories();
      
      // 初始化图表
      if (chart) {
        updateChartData();
      } else {
        nextTick(() => {
          initChart();
        });
      }
    } else {
      console.error('获取知识图谱数据失败:', response);
    }
  } catch (error) {
    console.error('获取知识图谱数据出错:', error);
  } finally {
    loading.value = false;
  }
};

// 处理后端返回的数据，转换为图谱所需格式
const processGraphData = (data) => {
  console.log('原始数据:', data);
  // 假设data是一个包含两个数组的对象 [nodes, links]
  const [nodesData, linksData] = data;
  
  // 处理节点数据
  const nodes = nodesData.map(item => ({
    id: item.achievementId,
    name: item.achievementName ||  '未命名成果',
    // symbolSize: calculateSymbolSize(item),
    category: item.achievementCategory || '其他',
    author: item.userName ? item.authors.join('、') : '',
    institution: item.organization || '',
    date: item.uploadTime || '',
 
    // 添加其他可能需要的字段
  }));

  
  // 处理连接数据
  const links = linksData.map(item => ({
    source: item.source.toString(),
    target: item.target.toString(),
    value: item.relationType || '关联'
  }));
  
  return { nodes, links };
};

// 根据成果的某些属性计算节点大小
const calculateSymbolSize = (item) => {
  // 可以根据引用次数、重要性等计算节点大小
  // 这里简单实现，可以根据实际需求调整
  const baseSize = 40;
  const citationFactor = item.citations ? Math.min(item.citations / 10, 3) : 0;
  return baseSize + citationFactor * 5;
};

// 更新类别列表
const updateCategories = () => {
  // 从节点数据中提取所有不同的类别
  const categorySet = new Set();
  originalData.value.nodes.forEach(node => {
    if (node.category) {
      categorySet.add(node.category);
    }
  });
  
  // 更新类别数组
  categories.value = Array.from(categorySet).map(name => ({ name }));
};

// 处理搜索输入
const handleSearchInput = () => {
  // 清除之前的定时器
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  // 设置新的定时器，延迟300ms执行搜索，减少频繁搜索
  searchTimeout.value = setTimeout(() => {
    performSearch();
  }, 300);
};

// 执行搜索
const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  const query = searchQuery.value.toLowerCase();
  
  // 在节点数据中搜索匹配项
  searchResults.value = originalData.value.nodes.filter(node => {
    return (
      node.name.toLowerCase().includes(query) || 
      (node.author && node.author.toLowerCase().includes(query)) || 
      (node.institution && node.institution.toLowerCase().includes(query))
    );
  });
};

// 聚焦到选中的节点
const focusOnNode = (node) => {
  // 关闭搜索结果显示
  searchResults.value = [];
  searchQuery.value = '';
  
  // 设置为聚焦模式并更新图谱
  focusedNodeId.value = node.id;
  displayMode.value = 'focused';
  updateGraphByFocus();
  
  // 高亮显示该节点
  if (chart) {
    chart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: currentData.value.nodes.findIndex(n => n.id === node.id)
    });
    
    // 将视图中心移动到该节点
    const nodeData = currentData.value.nodes.find(n => n.id === node.id);
    if (nodeData && nodeData.x && nodeData.y) {
      chart.setOption({
        graphic: [{
          type: 'circle',
          position: [nodeData.x, nodeData.y],
          shape: { r: 0 },
          invisible: true,
          z: 100
        }]
      });
      
      chart.dispatchAction({
        type: 'graphRoam',
        zoom: 2, // 放大倍数
        offsetX: 0,
        offsetY: 0
      });
    }
  }
  
  // 显示节点详细信息
  selectedNode.value = node;
};

// 根据聚焦节点筛选数据
const updateGraphByFocus = () => {
  if (displayMode.value === 'all' || !focusedNodeId.value) {
    // 正常显示，根据关联条件筛选
    updateGraphByRelations();
    return;
  }
  
  // 找出与焦点节点有关联的所有连接
  const filteredLinks = originalData.value.links.filter(link => {
    return (link.source === focusedNodeId.value || link.target === focusedNodeId.value) && 
           selectedRelations.value.includes(link.value);
  });
  
  // 获取相关节点的ID
  const relatedNodeIds = new Set([focusedNodeId.value]);
  filteredLinks.forEach(link => {
    relatedNodeIds.add(link.source);
    relatedNodeIds.add(link.target);
  });
  
  // 筛选节点
  const filteredNodes = originalData.value.nodes.filter(node => 
    relatedNodeIds.has(node.id)
  );
  
  // 更新当前数据
  currentData.value = {
    nodes: filteredNodes,
    links: filteredLinks
  };
  
  // 更新图表
  if (chart) {
    chart.setOption({
      series: [{
        data: currentData.value.nodes,
        links: currentData.value.links
      }]
    });
  }
};

// 显示选中节点的关联图谱
const showRelatedGraph = (node) => {
  focusedNodeId.value = node.id;
  displayMode.value = 'focused';
  updateGraphByFocus();
  
  // 关闭节点信息弹窗
  closeNodeInfo();
};

// 根据关联条件筛选数据
const filterDataByRelations = () => {
  // 首先筛选符合条件的连接
  const filteredLinks = originalData.value.links.filter(link => 
    selectedRelations.value.includes(link.value)
  );
  
  // 获取所有在筛选后的连接中出现的节点ID
  const nodeIdsInLinks = new Set();
  filteredLinks.forEach(link => {
    nodeIdsInLinks.add(link.source);
    nodeIdsInLinks.add(link.target);
  });
  
  // 筛选节点
  const filteredNodes = originalData.value.nodes.filter(node => 
    nodeIdsInLinks.has(node.id)
  );
  
  return {
    nodes: filteredNodes,
    links: filteredLinks
  };
};

// 根据关联条件更新图谱
const updateGraphByRelations = () => {
  if (displayMode.value === 'focused' && focusedNodeId.value) {
    // 如果是聚焦模式，则调用聚焦更新函数
    updateGraphByFocus();
    return;
  }
  
  currentData.value = filterDataByRelations();
  if (chart) {
    chart.setOption({
      series: [{
        data: currentData.value.nodes,
        links: currentData.value.links
      }]
    });
  }
};

// 选择所有关联条件
const selectAllRelations = () => {
  selectedRelations.value = relationOptions.map(option => option.value);
  if (displayMode.value === 'focused') {
    updateGraphByFocus();
  } else {
    updateGraphByRelations();
  }
};

// 清除所有关联条件
const clearAllRelations = () => {
  selectedRelations.value = [];
  updateGraphByRelations();
};

// 重置图谱到原始状态
const resetGraph = () => {
  // 重置为显示所有模式
  displayMode.value = 'all';
  focusedNodeId.value = null;
  
  // 重置条件选择
  selectedRelations.value = relationOptions.map(option => option.value);
  
  // 重置数据
  currentData.value = {
    nodes: [...originalData.value.nodes],
    links: [...originalData.value.links]
  };
  
  if (chart) {
    chart.setOption({
      series: [{
        data: currentData.value.nodes,
        links: currentData.value.links
      }]
    });
  }
};

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
    
    // 图表配置项
    const option = {
      title: {
        text: '科研成果知识图谱',
        subtext: '基于成果作者、机构和项目的关联',
        top: 'top',
        left: 'center'
      },
      tooltip: {
        formatter: function(params) {
          if (params.dataType === 'node') {
            return `<div>
              <div><strong>${params.data.name}</strong></div>
              <div>类型: ${params.data.category}</div>
              <div>作者: ${params.data.author}</div>
              <div>单位: ${params.data.institution}</div>
            </div>`;
          } else {
            return `关系: ${params.data.value}`;
          }
        }
      },
      legend: {
        data: categories.value.map(a => a.name),
        orient: 'vertical',
        left: 'left',
        top: 'middle'
      },
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          name: '知识图谱',
          type: 'graph',
          layout: 'force',
          data: currentData.value.nodes,
          links: currentData.value.links,
          categories: categories.value,
          roam: true,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}'
          },
          edgeLabel: {
            show: true,
            formatter: '{c}',
            fontSize: 12
          },
          lineStyle: {
            color: 'source',
            curveness: 0.3
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4
            }
          },
          force: {
            repulsion: 200,
            gravity: 0.1,
            edgeLength: 150,
            friction: 0.2
          }
        }
      ]
    };
    
    // 设置图表配置并渲染
    chart.setOption(option);
    
    // 添加节点点击事件
    chart.on('click', function(params) {
      if (params.dataType === 'node') {
        selectedNode.value = params.data;
      }
    });
    
    // 窗口大小改变时自动调整图表大小
    window.addEventListener('resize', handleResize);
  }
};

// 添加新成果后更新图谱
const updateGraph = (newData) => {
  if (chart) {
    // 更新原始数据
    originalData.value.nodes.push(...newData.nodes);
    originalData.value.links.push(...newData.links);
    
    // 根据当前显示模式更新图谱
    if (displayMode.value === 'focused') {
      updateGraphByFocus();
    } else {
      updateGraphByRelations();
    }
  }
};

// 窗口大小改变时调整图表大小
const handleResize = () => {
  chart && chart.resize();
};

// 关闭节点信息弹窗
const closeNodeInfo = () => {
  selectedNode.value = null;
};

// 监听关联条件变化
watch(selectedRelations, () => {
  if (displayMode.value === 'focused') {
    updateGraphByFocus();
  } else {
    updateGraphByRelations();
  }
}, { deep: true });

// 组件挂载后获取数据并初始化图表
onMounted(() => {
  fetchKnowledgeGraphData();
});

// 组件卸载前移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chart && chart.dispose();
});

// 模拟添加新成果（可以通过API获取实际数据）
const addNewAchievement = () => {
  const newData = {
    nodes: [
      {
        id: '8',
        name: '医疗机器人控制算法',
        symbolSize: 45,
        category: '专利',
        author: '张三、赵六',
        institution: '北京大学',
        date: '2024-10-05',
        version: 'v1.0',
        project: '国家重点研发计划'
      }
    ],
    links: [
      { source: '8', target: '1', value: '同一作者' },
      { source: '8', target: '3', value: '同一作者' },
      { source: '8', target: '5', value: '同一作者' },
      { source: '8', target: '7', value: '同一项目' }
    ]
  };
  
  updateGraph(newData);
};

// 更新图表数据
const updateChartData = () => {
  if (chart) {
    chart.setOption({
      legend: {
        data: categories.value.map(a => a.name)
      },
      series: [{
        data: currentData.value.nodes,
        links: currentData.value.links,
        categories: categories.value
      }]
    });
  }
};

// 暴露方法给父组件使用
defineExpose({
  updateGraph,
  addNewAchievement,
  selectAllRelations,
  clearAllRelations,
  resetGraph,
  performSearch,
  focusOnNode,
  fetchKnowledgeGraphData // 暴露刷新数据的方法
});
</script>

<style scoped>
.knowledge-graph-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-container {
  position: relative;
  margin-bottom: 15px;
}

.search-box {
  display: flex;
  width: 100%;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #1890ff;
}

.search-btn {
  padding: 10px 15px;
  background-color: #1890ff;
  border: 1px solid #1890ff;
  border-radius: 0 4px 4px 0;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #40a9ff;
}

.search-icon {
  font-size: 16px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.search-result-item {
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.result-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.result-meta {
  display: flex;
  font-size: 12px;
  color: #888;
}

.result-type {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 10px;
  margin-right: 10px;
}

.result-author {
  color: #666;
}

.filter-container {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.filter-container h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.filter-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.filter-option input {
  margin-right: 6px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #e9e9e9;
}

.filter-btn.primary {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.filter-btn.primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.chart-container {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  flex-grow: 1;
}

.node-info-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  width: 300px;
  z-index: 1000;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.popup-content {
  padding: 15px;
}

.popup-content p {
  margin: 8px 0;
  font-size: 14px;
}

.popup-actions {
  margin-top: 15px;
  text-align: center;
}

.action-btn {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-btn:hover {
  background-color: #40a9ff;
}

/* 添加加载状态样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
<template>
  <div class="knowledge-graph-container">
    <div class="control-panel">
      <h2>知识图谱可视化</h2>
      
      <!-- 添加加载状态和错误提示 -->
      <div v-if="isLoading" class="loading-state">
        <p>加载数据中...</p>
      </div>
      
      <div v-else-if="loadError" class="error-state">
        <p>{{ loadError }}</p>
        <button @click="retryFetch">重试</button>
        <button @click="useFallbackData">使用示例数据</button>
      </div>
      
      <template v-else>
        <div class="search-box">
          <input 
            v-model="searchText" 
            placeholder="搜索节点..." 
            @input="handleSearch"
          />
        </div>
        
        <div class="relation-filters">
          <h3>按关系类型筛选</h3>
          <div v-for="(checked, relation) in relationFilters" :key="relation" class="filter-item">
            <input 
              type="checkbox" 
              :id="relation" 
              v-model="relationFilters[relation]" 
              @change="updateGraph"
            />
            <label :for="relation" :style="{color: getRelationColor(relation)}">{{ relation }}</label>
          </div>
        </div>
        
        <div class="layout-controls">
          <h3>布局选项</h3>
          <div class="layout-option">
            <select v-model="layoutType" @change="updateGraph">
              <option value="force">力导向布局</option>
              <option value="circular">环形布局</option>
            </select>
          </div>
        </div>
        
        <div class="actions">
          <button @click="resetGraph">重置视图</button>
        </div>
      </template>
    </div>
    <div class="chart-container" ref="chartContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getKnowledgeGraph } from '../../api/search';

// 图表容器引用
const chartContainer = ref(null);
let chart = null;

// 搜索和布局控制
const searchText = ref('');
const layoutType = ref('force');

// 存储三元组数据 - 初始化为空数组而不是 null
const rawTriples = ref([]);
const isLoading = ref(true);
const loadError = ref(null);

// 示例数据 - 当API失败时使用
const fallbackData = [
  ['自动化测试流程', '所属类别', 'report'],
  ['自动化测试流程', '归档形式', '6'],
  ['自动化测试流程', '所属知识产权类型', 'null'],
  ['5', '拥有', '4'],
  ['4', '包含', '自动化测试流程'],
  ['1', '创建', '自动化测试流程'],
  ['应用部署优化', '所属类别', 'project'],
  ['应用部署优化', '归档形式', '8'],
  ['应用部署优化', '所属知识产权类型', 'null'],
  ['7', '拥有', '6'],
  ['6', '包含', '应用部署优化'],
  ['3', '创建', '应用部署优化']
];

// 获取知识图谱数据
async function fetchKnowledgeGraph() {
  try {
    isLoading.value = true;
    loadError.value = null;
    
    // 获取数据
    console.log('正在获取知识图谱数据...');
    let response;
    
    try {
      response = await getKnowledgeGraph();
      console.log('API原始返回:', response);
    } catch (apiError) {
      console.error('API调用错误:', apiError);
      throw new Error(`API调用失败: ${apiError.message || '未知API错误'}`);
    }
    
    // 添加数据验证
    if (!response) {
      throw new Error('API返回空数据');
    }
    
    if (!Array.isArray(response)) {
      console.error('API返回的不是数组格式:', response);
      throw new Error('API返回的不是数组格式');
    }
    
    // 修正数据: 过滤掉无效的三元组
    const validTriples = response.filter(triple => {
      return Array.isArray(triple) && triple.length === 3 && 
             triple[0] !== null && triple[0] !== undefined &&
             triple[1] !== null && triple[1] !== undefined &&
             triple[2] !== null && triple[2] !== undefined;
    });
    
    if (validTriples.length === 0) {
      throw new Error('没有有效的三元组数据');
    }
    
    rawTriples.value = validTriples;
    console.log(`成功加载 ${rawTriples.value.length} 个三元组数据`);
    
    // 初始化关系过滤器
    initRelationFilters();
    
    // 在下一个DOM更新周期更新图表
    await nextTick();
    updateGraph();
    
  } catch (error) {
    console.error('Error fetching knowledge graph:', error);
    loadError.value = `获取数据失败: ${error.message || '未知错误'}`;
  } finally {
    isLoading.value = false;
  }
}

// 使用备用数据
function useFallbackData() {
  try {
    rawTriples.value = [...fallbackData]; // 使用备用数据的副本
    console.log('使用备用数据');
    initRelationFilters();
    
    nextTick(() => {
      updateGraph();
    });
  } catch (error) {
    console.error('使用备用数据失败:', error);
    loadError.value = `使用备用数据失败: ${error.message}`;
  }
}

// 重试获取数据
function retryFetch() {
  fetchKnowledgeGraph();
}

// 关系过滤器初始化
const relationFilters = reactive({});

// 初始化关系过滤器
function initRelationFilters() {
  // 清空现有过滤器
  Object.keys(relationFilters).forEach(key => {
    delete relationFilters[key];
  });
  
  const relationTypes = new Set();
  
  // 安全地提取所有关系类型
  if (Array.isArray(rawTriples.value)) {
    rawTriples.value.forEach(triple => {
      if (triple && Array.isArray(triple) && triple.length >= 2 && triple[1] && triple[1] !== "null") {
        relationTypes.add(triple[1]);
      }
    });
  }
  
  // 初始化过滤器状态
  Array.from(relationTypes).forEach(relation => {
    relationFilters[relation] = true;
  });
  
  console.log('检测到的关系类型:', Array.from(relationTypes));
}

// 为不同关系类型分配不同颜色
function getRelationColor(relation) {
  const colorMap = {
    '所属类别': '#FF5722',
    '归档形式': '#2196F3',
    '所属知识产权类型': '#9C27B0',
    '拥有': '#4CAF50',
    '包含': '#FFC107',
    '创建': '#607D8B'
  };
  
  return colorMap[relation] || '#999';
}

// 将三元组数据转换为图表所需的节点和链接格式
function processTriples(triples, searchKeyword = '') {
  // 防御性检查
  if (!Array.isArray(triples) || triples.length === 0) {
    console.warn('processTriples: 无效的三元组数据', triples);
    return { nodes: [], links: [] };
  }
  
  const nodesMap = new Map();
  const links = [];
  const searchLower = (searchKeyword || '').toLowerCase();
  const isSearching = searchKeyword.trim() !== '';
  
  // 用于跟踪搜索命中的节点
  const matchedNodes = new Set();
  
  // 处理三元组
  triples.forEach((triple, index) => {
    // 检查 triple 格式
    if (!triple || !Array.isArray(triple) || triple.length < 3) {
      console.warn(`第 ${index} 个三元组无效:`, triple);
      return;
    }
    
    // 确保所有元素都是字符串
    const source = String(triple[0]);
    const relation = String(triple[1]);
    const target = String(triple[2]);
    
    // 忽略无效值
    if (source === "null" || target === "null" || !relationFilters[relation]) {
      return;
    }
    
    // 检查是否匹配搜索词
    const sourceMatches = isSearching && source.toLowerCase().includes(searchLower);
    const targetMatches = isSearching && target.toLowerCase().includes(searchLower);
    
    if (sourceMatches) matchedNodes.add(source);
    if (targetMatches) matchedNodes.add(target);
    
    // 如果正在搜索，但两个节点都不匹配，则跳过此关系
    if (isSearching && !sourceMatches && !targetMatches) {
      return;
    }
    
    // 添加头实体节点
    if (!nodesMap.has(source)) {
      nodesMap.set(source, {
        id: source,
        name: source,
        symbolSize: source.length <= 2 ? 30 : Math.min(60, 30 + source.length * 1.5),
        category: getCategoryFromNode(source),
        itemStyle: {
          color: sourceMatches ? '#f44336' : undefined
        }
      });
    } else if (sourceMatches && !nodesMap.get(source).itemStyle?.color) {
      // 更新已存在的节点，标记为搜索匹配
      const node = nodesMap.get(source);
      if (node) {
        node.itemStyle = { color: '#f44336' };
      }
    }
    
    // 添加尾实体节点
    if (!nodesMap.has(target)) {
      nodesMap.set(target, {
        id: target,
        name: target,
        symbolSize: target.length <= 2 ? 30 : Math.min(60, 30 + target.length * 1.5),
        category: getCategoryFromNode(target),
        itemStyle: {
          color: targetMatches ? '#f44336' : undefined
        }
      });
    } else if (targetMatches && !nodesMap.get(target).itemStyle?.color) {
      // 更新已存在的节点，标记为搜索匹配
      const node = nodesMap.get(target);
      if (node) {
        node.itemStyle = { color: '#f44336' };
      }
    }
    
    // 添加关系边
    links.push({
      source: source,
      target: target,
      value: relation,
      label: {
        show: true,
        formatter: relation
      },
      lineStyle: {
        width: 2,
        curveness: 0.2,
        color: getRelationColor(relation)
      }
    });
  });
  
  // 确保节点和链接格式正确
  const nodes = Array.from(nodesMap.values()).map(node => {
    return {
      ...node,
      // 确保所有必需属性都有定义
      id: node.id || 'unknown',
      name: node.name || 'unnamed',
      symbolSize: node.symbolSize || 30,
      category: node.category !== undefined ? node.category : 0
    };
  });
  
  // 如果用户在搜索但没有匹配项，我们应该保留一些节点以显示"无结果"的状态
  if (isSearching && matchedNodes.size === 0 && nodes.length > 0) {
    // 清空结果，只保留一条消息
    return {
      nodes: [{
        id: 'no-results',
        name: '无匹配结果',
        symbolSize: 50,
        category: 3,
        itemStyle: {
          color: '#d32f2f'
        }
      }],
      links: []
    };
  }
  
  return { nodes, links };
}

// 根据节点的特征确定其类别
function getCategoryFromNode(node) {
  if (!node) return 0;
  
  const nodeStr = String(node);
  
  // 简单判断：数字ID很可能是用户或项目ID
  if (/^\d+$/.test(nodeStr)) {
    return 0; // ID类别
  }
  
  // 根据关键词判断
  if (/report|paper|patent|project/.test(nodeStr)) {
    return 1; // 成果类型
  }
  
  // 其他情况认为是成果名称
  return 2; // 成果名称
}

// 处理搜索输入
function handleSearch() {
  updateGraph();
}

// 重置图表到初始状态
function resetGraph() {
  searchText.value = '';
  layoutType.value = 'force';
  
  // 重置所有关系过滤器为选中状态
  Object.keys(relationFilters).forEach(key => {
    relationFilters[key] = true;
  });
  
  updateGraph();
  
  if (chart) {
    chart.dispatchAction({
      type: 'restore'
    });
  }
}

// 更新图表
function updateGraph() {
  if (!chart) {
    console.warn('图表实例未初始化');
    return;
  }
  
  try {
    // 确保rawTriples.value是数组
    if (!Array.isArray(rawTriples.value) || rawTriples.value.length === 0) {
      console.warn('更新图表失败: 没有有效的三元组数据', rawTriples.value);
      // 显示空状态图表
      chart.setOption({
        title: {
          text: '无数据可显示',
          top: 'middle',
          left: 'center',
          textStyle: {
            fontSize: 20,
            color: '#999'
          }
        },
        series: [{
          type: 'graph',
          layout: 'none',
          data: [],
          links: []
        }]
      });
      return;
    }
    
    // 过滤三元组
    const filteredTriples = rawTriples.value.filter(triple => {
      return triple && Array.isArray(triple) && triple.length >= 2 && relationFilters[triple[1]];
    });
    
    console.log(`过滤后的三元组数: ${filteredTriples.length}`);
    
    // 处理三元组数据
    const { nodes, links } = processTriples(filteredTriples, searchText.value);
    
    console.log(`生成的节点数: ${nodes.length}, 链接数: ${links.length}`);
    
    // 防止空数据导致错误
    if (nodes.length === 0) {
      chart.setOption({
        title: {
          text: '没有符合条件的数据',
          top: 'middle',
          left: 'center',
          textStyle: {
            fontSize: 20,
            color: '#999'
          }
        },
        series: [{
          type: 'graph',
          layout: 'none',
          data: [],
          links: []
        }]
      });
      return;
    }
    
    const categories = [
      { name: 'ID' },
      { name: '成果类型' },
      { name: '成果名称' },
      { name: '搜索结果' }
    ];
    
    const option = {
      title: {
        text: `知识图谱关系可视化 (${nodes.length}个节点, ${links.length}个关系)`,
        top: 'top',
        left: 'center'
      },
      tooltip: {
        formatter: function(params) {
          if (params.dataType === 'node') {
            return `<strong>${params.name}</strong>`;
          } else {
            return `<strong>${params.data.source}</strong> 
                    <div>${params.data.value}</div> 
                    <strong>${params.data.target}</strong>`;
          }
        }
      },
      legend: [{
        data: categories.map(a => a.name),
        top: 30,
        left: 'center',
        selectedMode: 'multiple'
      }],
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          name: '知识图谱',
          type: 'graph',
          layout: layoutType.value,
          data: nodes,
          links: links,
          categories: categories,
          roam: true,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}'
          },
          // 根据布局类型设置不同的力导向参数
          force: layoutType.value === 'force' ? {
            repulsion: 200,
            edgeLength: [80, 120]
          } : undefined,
          circular: layoutType.value === 'circular' ? {
            rotateLabel: true
          } : undefined,
          lineStyle: {
            color: 'source',
            curveness: 0.3
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 5
            }
          }
        }
      ]
    };
    
    // 使用 clear() 方法清除之前的图表以避免潜在的冲突
    chart.clear();
    
    // 设置新选项
    chart.setOption(option);
    
  } catch (error) {
    console.error('更新图表时发生错误:', error);
    
    // 显示错误状态
    if (chart) {
      chart.setOption({
        title: {
          text: '图表更新失败',
          subtext: error.message,
          top: 'middle',
          left: 'center',
          textStyle: {
            fontSize: 20,
            color: '#d32f2f'
          },
          subtextStyle: {
            color: '#555'
          }
        },
        series: [{
          type: 'graph',
          layout: 'none',
          data: [],
          links: []
        }]
      });
    }
  }
}

// 监听布局类型变化
watch(layoutType, () => {
  updateGraph();
});

// 组件挂载后初始化图表
onMounted(async () => {
  // 确保DOM已经渲染
  await nextTick();
  
  if (chartContainer.value) {
    try {
      // 延迟初始化以确保DOM已完全可用
      setTimeout(() => {
        // 检查容器尺寸
        const containerWidth = chartContainer.value.clientWidth;
        const containerHeight = chartContainer.value.clientHeight;
        
        console.log(`图表容器尺寸: ${containerWidth}x${containerHeight}`);
        
        if (containerWidth === 0 || containerHeight === 0) {
          throw new Error('图表容器尺寸为0，无法初始化图表');
        }
        
        // 初始化图表
        chart = echarts.init(chartContainer.value);
        
        // 添加错误处理
        chart.on('rendererror', function(params) {
          console.error('ECharts 渲染错误:', params);
        });
        
        // 添加窗口大小调整处理
        window.addEventListener('resize', () => {
          if (chart) {
            chart.resize();
          }
        });
        
        // 获取知识图谱数据
        fetchKnowledgeGraph();
      }, 100);
    } catch (error) {
      console.error('初始化图表失败:', error);
      loadError.value = `初始化图表失败: ${error.message}`;
    }
  } else {
    console.error('图表容器不存在');
    loadError.value = '图表容器不存在';
  }
});
</script>

<style scoped>
.knowledge-graph-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.control-panel {
  width: 250px;
  padding: 16px;
  border-right: 1px solid #eee;
  background-color: #f8f9fa;
  overflow-y: auto;
}

.chart-container {
  flex: 1;
  height: 100%;
  min-height: 400px; /* 确保最小高度 */
}

/* 加载中、错误和空状态的样式 */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
}

.error-state {
  color: #d32f2f;
}

.error-state button, .empty-state button {
  margin-top: 10px;
  padding: 6px 12px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

h2 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

h3 {
  margin-top: 16px;
  margin-bottom: 8px;
  color: #555;
  font-size: 1em;
}

.search-box {
  margin-bottom: 16px;
}

.search-box input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.relation-filters {
  margin-bottom: 24px;
}

.filter-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.filter-item input {
  margin-right: 8px;
}

.filter-item label {
  cursor: pointer;
}

.layout-controls {
  margin-bottom: 24px;
}

.layout-option select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions button {
  width: 100%;
  padding: 8px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 8px;
}

.actions button:hover {
  background-color: #45a049;
}
</style>

<!-- 实现基本功能，能够正确显示后端信息 -->
 <!-- 需要进一步完成 对关系的更改 -->
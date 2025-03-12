<template>
  <div class="knowledge-graph-container">
    <div class="control-panel">
      <h2>知识图谱可视化</h2>
      
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
    </div>
    <div class="chart-container" ref="chartContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import * as echarts from 'echarts';
import { getKnowledgeGraph } from '../../api/search'; // Import the API function

// 图表容器引用
const chartContainer = ref(null);
let chart = null;

// 搜索和布局控制
const searchText = ref('');
const layoutType = ref('force');


const rawTriples = [
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
  ['3', '创建', '应用部署优化'],
  ['集成模块设计', '所属类别', 'patent'],
  ['集成模块设计', '归档形式', '9'],
  ['集成模块设计', '所属知识产权类型', 'null'],
  ['8', '拥有', '7'],
  ['7', '包含', '集成模块设计'],
  ['4', '创建', '集成模块设计'],
  ['通信协议开发', '所属类别', 'project'],
  ['通信协议开发', '归档形式', '10'],
  ['通信协议开发', '所属知识产权类型', 'null'],
  ['9', '拥有', '8'],
  ['8', '包含', '通信协议开发'],
  ['5', '创建', '通信协议开发'],
  ['智能雷达应用', '所属类别', 'project'],
  ['智能雷达应用', '归档形式', '8'],
  ['智能雷达应用', '所属知识产权类型', 'null'],
  ['7', '拥有', '6'],
  ['6', '包含', '智能雷达应用'],
  ['3', '创建', '智能雷达应用'],
  ['集成测试技术', '所属类别', 'patent'],
  ['集成测试技术', '归档形式', '9'],
  ['集成测试技术', '所属知识产权类型', 'null'],
  ['8', '拥有', '7'],
  ['7', '包含', '集成测试技术'],
  ['4', '创建', '集成测试技术']
];


console.log(rawTriples);
// 解析三元组数据
// const rawTriples = parseTripleData(rawTriplesText);



// 存储所有的关系类型
const relationTypes = new Set();
rawTriples.forEach(triple => {
  if (triple[1] && triple[1] !== "null") {
    relationTypes.add(triple[1]);
  }
});

// 关系过滤器状态
const relationFilters = reactive(
  Array.from(relationTypes).reduce((acc, relation) => {
    acc[relation] = true;
    return acc;
  }, {})
);

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
  const nodesMap = new Map();
  const links = [];
  const searchLower = searchKeyword.toLowerCase();
  const isSearching = searchKeyword.trim() !== '';
  
  // 用于跟踪搜索命中的节点
  const matchedNodes = new Set();
  
  // 首先找出所有节点
  triples.forEach(triple => {
    const [source, relation, target] = triple;
    
    // 忽略null值
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
      node.itemStyle = { color: '#f44336' };
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
      node.itemStyle = { color: '#f44336' };
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
  
  // 如果用户在搜索但没有匹配项，我们应该保留一些节点以显示"无结果"的状态
  if (isSearching && matchedNodes.size === 0 && nodesMap.size > 0) {
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
  
  return {
    nodes: Array.from(nodesMap.values()),
    links: links
  };
}

// 根据节点的特征确定其类别
function getCategoryFromNode(node) {
  // 简单判断：数字ID很可能是用户或项目ID
  if (/^\d+$/.test(node)) {
    return 0; // ID类别
  }
  
  // 根据关键词判断
  if (/report|paper|patent|project/.test(node)) {
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
  if (!chart) return;
  
  // 过滤三元组
  const filteredTriples = rawTriples.filter(triple => {
    return relationFilters[triple[1]];
  });
  
  const { nodes, links } = processTriples(filteredTriples, searchText.value);
  
  const categories = [
    { name: 'ID' },
    { name: '成果类型' },
    { name: '成果名称' },
    { name: '搜索结果' }
  ];
  
  const option = {
    title: {
      text: '知识图谱关系可视化',
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
  
  chart.setOption(option);
}

// 监听布局类型变化
watch(layoutType, () => {
  updateGraph();
});

// 组件挂载后初始化图表
onMounted(() => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value);
    window.addEventListener('resize', () => {
      chart.resize();
    });
    updateGraph();
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
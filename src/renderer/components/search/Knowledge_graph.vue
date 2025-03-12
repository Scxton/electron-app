<template>
  <div class="knowledge-graph-container">
    <!-- 左侧筛选面板 -->
    <div class="filter-panel">
      <h3>节点信息</h3>
      <div v-if="selectedNode" class="node-info">
        <p><strong>名称：</strong>{{ selectedNode.name }}</p>
        <p><strong>类型：</strong>{{ selectedNode.category }}</p>
        <p><strong>发布日期：</strong>{{ selectedNode.publishDate }}</p>
        <p><strong>版本：</strong>{{ selectedNode.version }}</p>
        <p><strong>来源项目：</strong>{{ selectedNode.project }}</p>
      </div>
      <div class="filter-section">
        <h4>成果类型</h4>
        <el-checkbox-group v-model="selectedTypes">
          <el-checkbox label="论文">论文</el-checkbox>
          <el-checkbox label="专利">专利</el-checkbox>
          <el-checkbox label="项目">项目</el-checkbox>
          <el-checkbox label="技术报告">技术报告</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="filter-section">
        <h4>关系类型</h4>
        <el-checkbox-group v-model="selectedRelations">
          <el-checkbox label="成果关联">作者关联</el-checkbox>
          <el-checkbox label="技术关联">单位关联</el-checkbox>
          
        </el-checkbox-group>
      </div>
    </div>

    <!-- 主图谱区域 -->
    <div class="main-graph">
      <div id="knowledge-graph" ref="chartRef"></div>
    </div>

    <!-- 添加调试信息显示区域 -->
    <div class="debug-info">
      <h3>调试信息:</h3>
      <pre>{{ debugInfo }}</pre>
      <div v-if="graphData.nodes.length > 0">
        <h4>数据统计:</h4>
        <p>节点数量: {{ graphData.nodes.length }}</p>
        <p>连接数量: {{ graphData.links.length }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { getKnowledgeGraph, getKnowledgeGraphWithFilters } from '../../api/search' // Import the API function

const chartRef = ref(null)
let chart = null
const showInfoDialog = ref(false)
const selectedNode = ref(null)
const loading = ref(false) // Add loading state
const debugInfo = ref('等待初始化...') // 添加调试信息

// 新增筛选状态
const selectedTypes = ref(['论文', '专利', '项目', '技术报告'])
const selectedRelations = ref(['成果关联', '技术关联'])

// 实际数据存储
const graphData = ref({
  nodes: [],
  links: []
})

// 获取知识图谱数据
const fetchKnowledgeGraphData = async () => {
  try {
    loading.value = true
    debugInfo.value = '正在获取数据...'
    
    // 根据是否有筛选条件决定使用哪个API
    let response
    if (selectedTypes.value.length < 4 || selectedRelations.value.length < 2) {
      // 有筛选条件，使用getbylimit接口
      const filters = {
        nodeTypes: selectedTypes.value,
        relationTypes: selectedRelations.value
      }
      debugInfo.value += ' | 使用筛选条件查询'
      response = await getKnowledgeGraphWithFilters(filters)
    } else {
      // 无筛选条件，使用getall接口
      debugInfo.value += ' | 查询所有数据'
      response = await getKnowledgeGraph()
    }
    
    console.log('API响应数据:', response) // 打印完整响应
    
    // 检查响应中是否包含data字段（JSONResult格式）
    const graphData = response.data || response
    
    debugInfo.value = `API响应: 获取到${Array.isArray(graphData) ? graphData.length : 0}条数据`
    
    if (Array.isArray(graphData) && graphData.length > 0) {
      debugInfo.value = `数据获取成功，正在处理${graphData.length}条记录...`
      
      // 检查第一条记录的格式来确定数据结构
      const firstItem = graphData[0]
      console.log('第一条记录:', firstItem)
      
      if (Array.isArray(firstItem) && firstItem.length === 3) {
        debugInfo.value += ' | 检测到三元组格式数据'
        
        // 处理三元组格式的数据 [source, relation, target]
        const nodesMap = new Map() // 用于存储唯一节点
        const links = []
        
        // 遍历所有三元组，提取节点和关系
        graphData.forEach((triplet, index) => {
          if (!Array.isArray(triplet) || triplet.length !== 3) {
            console.warn(`跳过无效的三元组数据 #${index}:`, triplet)
            return
          }
          
          const [source, relation, target] = triplet
          
          // 处理源节点
          if (!nodesMap.has(source)) {
            // 根据节点名称推断类型
            const category = inferNodeCategory(source)
            
            nodesMap.set(source, {
              id: String(source),
              name: String(source),
              category: category,
              symbolSize: 50,
              publishDate: '未知',
              version: '1.0',
              project: '未知'
            })
          }
          
          // 处理目标节点
          if (!nodesMap.has(target)) {
            // 根据节点名称推断类型
            const category = inferNodeCategory(target)
            
            nodesMap.set(target, {
              id: String(target),
              name: String(target),
              category: category,
              symbolSize: 50,
              publishDate: '未知',
              version: '1.0',
              project: '未知'
            })
          }
          
          // 添加关系
          links.push({
            source: String(source),
            target: String(target),
            value: String(relation)
          })
        })
        
        // 将Map转换为数组
        const nodes = Array.from(nodesMap.values())
        
        // 更新图谱数据
        graphData.value = {
          nodes,
          links
        }
        
        debugInfo.value = `处理完成: ${nodes.length}个节点, ${links.length}个连接`
        console.log('处理后的节点:', nodes)
        console.log('处理后的连接:', links)
      } else {
        debugInfo.value += ' | 未识别的数据格式，尝试直接处理'
        
        // 尝试将响应作为节点数组处理
        const nodes = graphData.map((item, index) => {
          // 尝试从item中提取信息
          const id = item.id || item[0] || String(index)
          const name = item.name || item[1] || `节点${index}`
          const category = inferNodeCategory(name)
          
          return {
            id: String(id),
            name: String(name),
            category: category,
            symbolSize: 50,
            publishDate: '未知',
            version: '1.0',
            project: '未知'
          }
        })
        
        // 生成一些示例连接
        const links = []
        for (let i = 0; i < nodes.length - 1; i++) {
          links.push({
            source: nodes[i].id,
            target: nodes[i + 1].id,
            value: '关联'
          })
        }
        
        graphData.value = { nodes, links }
        debugInfo.value = `处理完成(备选方案): ${nodes.length}个节点, ${links.length}个连接`
      }
    } else {
      console.error('获取知识图谱数据失败或数据为空:', response)
      debugInfo.value = `获取数据失败或数据为空`
      
      // 使用模拟数据
      useMockData()
    }
  } catch (error) {
    console.error('获取知识图谱数据出错:', error)
    debugInfo.value = `获取数据出错: ${error.message}`
    
    // 使用模拟数据
    useMockData()
  } finally {
    loading.value = false
    updateChart() // 获取数据后更新图表
  }
}

// 根据节点名称推断类型
const inferNodeCategory = (nodeName) => {
  nodeName = String(nodeName).toLowerCase()
  
  if (nodeName.includes('论文') || nodeName.includes('研究') || nodeName.includes('study') || 
      nodeName.includes('paper') || nodeName.includes('research')) {
    return '论文'
  } else if (nodeName.includes('专利') || nodeName.includes('patent')) {
    return '专利'
  } else if (nodeName.includes('项目') || nodeName.includes('project') || 
             nodeName.includes('system') || nodeName.includes('系统')) {
    return '项目'
  } else if (nodeName.includes('报告') || nodeName.includes('report')) {
    return '技术报告'
  }
  
  // 默认返回论文类型
  return '论文'
}

// 使用模拟数据
const useMockData = () => {
  debugInfo.value += ' | 使用模拟数据'
  
  // 模拟数据
  graphData.value = {
    nodes: [
      { id: '1', name: '机器学习算法研究', category: '论文', symbolSize: 50,
        publishDate: '2024-02-15', version: '1.0', project: 'AI基础研究' },
      { id: '2', name: '深度学习专利A', category: '专利', symbolSize: 50,
        publishDate: '2024-01-20', version: '2.0', project: '智能算法项目' },
      { id: '3', name: '数据挖掘系统', category: '项目', symbolSize: 50,
        publishDate: '2023-12-01', version: '1.5', project: '大数据平台' },
      { id: '4', name: '神经网络优化方法', category: '论文', symbolSize: 50,
        publishDate: '2024-01-10', version: '1.0', project: 'AI基础研究' },
      { id: '5', name: '智能识别算法', category: '专利', symbolSize: 50,
        publishDate: '2023-11-15', version: '1.0', project: '计算机视觉' },
      { id: '6', name: '知识图谱构建', category: '项目', symbolSize: 50,
        publishDate: '2024-02-01', version: '2.0', project: '知识工程' },
    ],
    links: [
      { source: '1', target: '2', value: '作者关联' },
      { source: '2', target: '3', value: '单位关联' },
      { source: '1', target: '4', value: '主题关联' },
      { source: '3', target: '5', value: '作者关联' },
      { source: '4', target: '6', value: '单位关联' },
    ]
  }
}

// 监听筛选变化并更新图表
const updateChart = () => {
  if (!chart) {
    debugInfo.value += ' | 图表实例不存在，无法更新'
    return
  }

  debugInfo.value += ' | 正在更新图表...'

  try {
    // 如果筛选条件变化，重新获取数据
    if (selectedTypes.value.length < 4 || selectedRelations.value.length < 2) {
      fetchKnowledgeGraphData()
      return
    }
    
    // 否则，在客户端进行筛选
    // 根据选中的类型筛选节点
    const filteredNodes = graphData.value.nodes.filter(node => 
      selectedTypes.value.includes(node.category)
    )

    // 获取筛选后节点的ID列表
    const filteredNodeIds = filteredNodes.map(node => node.id)

    // 根据选中的关系类型和节点筛选连线
    const filteredLinks = graphData.value.links.filter(link => 
      selectedRelations.value.includes(link.value) && 
      filteredNodeIds.includes(link.source) && 
      filteredNodeIds.includes(link.target)
    )

    debugInfo.value += ` | 筛选后: ${filteredNodes.length}个节点, ${filteredLinks.length}个连接`

    // 更新图表配置
    const option = getChartOption()
    option.series[0].data = filteredNodes
    option.series[0].links = filteredLinks
    
    console.log('设置图表选项:', option)
    chart.setOption(option)
    debugInfo.value += ' | 图表已更新'
  } catch (error) {
    console.error('更新图表出错:', error)
    debugInfo.value += ` | 更新图表出错: ${error.message}`
  }
}

// 监听筛选变化
watch([selectedTypes, selectedRelations], () => {
  debugInfo.value = '筛选条件已更改，正在更新...'
  // 当筛选条件变化时，重新获取数据
  fetchKnowledgeGraphData()
}, { deep: true })

// 更新图表配置
const getChartOption = () => {
  // 检查是否有数据
  if (graphData.value.nodes.length === 0) {
    debugInfo.value += ' | 警告: 没有节点数据'
  }
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        if (params.dataType === 'node') {
          return `
            <div>
              <p><strong>${params.data.name}</strong></p>
              <p>类型: ${params.data.category}</p>
              <p>发布日期: ${params.data.publishDate}</p>
              <p>版本: ${params.data.version}</p>
              <p>项目: ${params.data.project}</p>
            </div>
          `
        } else {
          return `${params.data.source} → ${params.data.target}: ${params.data.value}`
        }
      }
    },
    legend: {
      data: ['论文', '专利', '项目', '技术报告']
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: [],
        links: [],
        categories: [
          { name: '论文' },
          { name: '专利' },
          { name: '项目' },
          { name: '技术报告' }
        ],
        roam: true,
        label: {
          show: true,
          position: 'right'
        },
        force: {
          repulsion: 100,
          edgeLength: 100
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4
          }
        }
      }
    ]
  }
}

// 初始化图表
const initChart = () => {
  debugInfo.value = '正在初始化图表...'
  
  if (!chartRef.value) {
    debugInfo.value = '图表容器不存在!'
    console.error('图表容器不存在')
    return
  }
  
  try {
    chart = echarts.init(chartRef.value)
    debugInfo.value += ' | 图表实例已创建'
    
    // 点击节点事件
    chart.on('click', (params) => {
      if (params.dataType === 'node') {
        selectedNode.value = params.data
        debugInfo.value = `选中节点: ${params.data.name}`
      }
    })
    
    // 先显示加载动画
    chart.showLoading()
    debugInfo.value += ' | 显示加载动画'
    
    // 获取数据后会自动更新图表
    fetchKnowledgeGraphData().finally(() => {
      chart.hideLoading()
      debugInfo.value += ' | 加载完成，隐藏加载动画'
    })
  } catch (error) {
    console.error('初始化图表出错:', error)
    debugInfo.value = `初始化图表出错: ${error.message}`
  }
}

const handleClose = () => {
  showInfoDialog.value = false
  selectedNode.value = null
}

// 处理窗口大小变化
const handleResize = () => {
  if (chart) {
    chart.resize()
    debugInfo.value = '窗口大小已变化，图表已调整'
  }
}

onMounted(() => {
  debugInfo.value = '组件已挂载'
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
  }
  window.removeEventListener('resize', handleResize)
  debugInfo.value = '组件已卸载'
})
</script>

<style lang="scss" scoped>
.knowledge-graph-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
}

.filter-panel {
  width: 280px;
  padding: 20px;
  background: white;
  border-right: 1px solid #e6e6e6;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);

  h3, h4 {
    margin-bottom: 16px;
    color: #333;
  }

  .filter-section {
    margin-bottom: 24px;
  }

  .node-info {
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 20px;

    p {
      margin: 8px 0;
      font-size: 14px;
    }
  }
}

.main-graph {
  flex: 1;
  height: 100%;
  
  #knowledge-graph {
    width: 100%;
    height: 100%;
  }
}

.filter-section {
  .el-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .el-checkbox {
      transition: opacity 0.3s;
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.debug-info {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  padding: 10px;
  max-width: 80%;
  max-height: 200px;
  overflow: auto;
  z-index: 1000;
  font-size: 12px;
  
  pre {
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
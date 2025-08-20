<template>
  <div class="container">
    <div class="top-section">
    </div>
    <!-- 界面中间部分的内容，即成果库总数、专利数量、论文数量、其他数量的统计值和占比 -->
    <div class="stats-container">
      <div class="total-stats">
        <span class="label">成果库总数</span>
        <span class="value">{{ totalCount }}</span>
      </div>
      <!-- <div class="stat-item">
        <el-progress type="circle" :percentage="patentRatio * 100" :width="100"></el-progress>
        <div class="info">
          <span class="name">专利</span>
          <span class="count">{{ patentCount }}</span>
          <span class="ratio">占比{{ (patentRatio * 100).toFixed(1) }}%</span>
        </div>
      </div>
      <div class="stat-item">
        <el-progress type="circle" :percentage="paperRatio * 100" :width="100"></el-progress>
        <div class="info">
          <span class="name">论文</span>
          <span class="count">{{ paperCount }}</span>
          <span class="ratio">占比{{ (paperRatio * 100).toFixed(1) }}%</span>
        </div>
      </div>
      <div class="stat-item">
        <el-progress type="circle" :percentage="othersRatio * 100" :width="100"></el-progress>
        <div class="info">
          <span class="name">其他</span>
          <span class="count">{{ othersCount }}</span>
          <span class="ratio">占比{{ (othersRatio * 100).toFixed(1) }}%</span>
        </div>
      </div> -->
      <div class="charts">
      <div class="chart-item">
        <PieChart :value="61.5" label="专利" />
        <p>专利</p>
        <p style="color: black">占比61.5%</p>
      </div>

      <div class="chart-item">
        <PieChart :value="30" label="论文" />
        <p>论文</p>
        <p style="color: black">占比30.0%</p>
      </div>

      <div class="chart-item">
        <PieChart :value="8.5" label="其他" />
        <p>其他</p>
        <p style="color: black">占比8.5%</p>
      </div>
    </div>

    </div>
    <div class="bottom-section">
      <TreeChart :json="treeData" />
    </div>
  </div>
</template>
  
<script setup>

import { ref, onMounted } from 'vue'
import { Calendar, ArrowDown, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// import PieChart from '../utils/PieChart.vue'
import PieChart from '../../utils/PieChart.vue'

const handleCommand = (command) => {
  ElMessage(`用户好评度： ${command}`)
}

// 模拟从后台获取的数据
const results = ref([]);
const selectedTime = ref('近一个月');

// 模拟获取数据的函数
const fetchResults = async () => {
  // 实际应替换为真实的API调用
  const mockData = [
    { name: '成果1迭代学习', score: 5 },
    { name: '成果2自适应控制', score: 4.6 },
    { name: '成果3过程控制', score: 3.0 },
    { name: '成果4机械控制', score: 2.5 },
    { name: '成果5航天器控制', score: 1.1 }
  ];
  results.value = mockData;
};

onMounted(() => {
  fetchResults();

  // 每 5 秒更新饼状图数据
  setInterval(() => {
    patent.value = Math.random() * 100;
    paper.value = Math.random() * (100 - patent.value);
    other.value = 100 - patent.value - paper.value;
  }, 5000); 
});


// 模拟数据
const totalCount = ref('601,986');
// const patentCount = ref('370,221');
// const paperCount = ref('180,596');
// const othersCount = ref('51,168');
// const patentRatio = ref(0.615);
// const paperRatio = ref(0.3);
// const othersRatio = ref(0.085);



const patent = ref(61.5);
const paper = ref(30);
const other = ref(8.5);


</script>
  
<style scoped>
.container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top-section {
  height: 340px;
  /* background-color: rgb(251, 239, 201); */
  background-image: url('../../assets/radar-bg-1.jpg'); /* 替换图片路径 */
  background-size: cover;  /* 让图片自适应缩放，填充整个区域 */
  background-position: center; /* 图片居中 */
  background-repeat: no-repeat; /* 防止图片重复 */
}

.charts {
  display: flex;
  justify-content: center;
  gap: 120px;
  margin-top: 20px;
}

.chart-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-container {
  height: 140px;
  background-color: rgb(187, 219, 240);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px;
}

.total-stats {
  text-align: left;
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 14px;
}

.value {
  font-size: 28px;
  font-weight: bold;
}

.stat-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  /* text-align: center; */
}

.info {
  /* margin-top: 10px; */
  margin-left: 10px;
  text-align: left;
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 14px;
}

.count {
  font-size: 18px;
  font-weight: bold;
}

.ratio {
  font-size: 12px;
  color: rgb(219, 13, 13);
}

/* .bottom-section {
  height: 400px;
  background-image: url('../../assets/dm-radar-1.jpg');
  background-size: cover; 
  background-position: center; 
  background-repeat: no-repeat; 
} */
.bottom-section {
  position: relative;
  aspect-ratio: 16 / 9; /* 让高度随宽度自适应 */
  background-image: url('../../assets/dm-radar-1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 在 .bottom-section 内添加一个透明模糊层 */
.bottom-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(3px); /* 10px 模糊 */
  background: rgba(255, 255, 255, 0.3); /* 半透明白色背景 */
}


/* .bottom-left {
  flex: 1;
  background-color: lightblue;
} */

/* .bottom-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
} */

.center-top {
  height: 150px;
  background-color: lightblue;
}

.center-bottom {
  height: 75px;
  /* text-align: left; */
  background-color: lightblue;
}

.bottom-right {
  flex: 1;
  background-color: lightblue;
  padding: 20px;

}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results {
  list-style: none;
  padding: 0;
}

.result {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.result-number {
  width: 20px;
  text-align: right;
  margin-right: 10px;
}

.star-wrapper {
  display: flex;
  margin-right: 10px;
}

.gold-star {
  color: gold;
}

.half-star {
  color: gold;
  opacity: 0.5;
}

.gray-star {
  color: #ccc;
}
</style>

<template>
  <div class="container">
    <div class="top-section"></div>
    <!-- 界面中间部分的内容，即成果库总数、专利数量、论文数量、其他数量的统计值和占比 -->
    <div class="stats-container">
      <div class="total-stats">
        <span class="label">成果库总数</span>
        <span class="value">{{ totalCount }}</span>
      </div>
      <div class="stat-item">
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
      </div>
    </div>
    <div class="bottom-section">
      <div class="bottom-left">

      </div>
      <div class="bottom-center">
        <div class="center-top"></div>
        <div class="center-bottom">
          <h1>联系管理员</h1>
          <h1>联系电话：800-810-000</h1>
        </div>
      </div>
      <div class="bottom-right">
        <div class="header">
          <h1>用户好评度</h1>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <el-icon>
                <Calendar />
              </el-icon>
              <span>{{ selectedTime }}</span>
              <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="近一个月" @click="selectedTime = '近一个月'">近一个月</el-dropdown-item>
                <el-dropdown-item command="近六个月" @click="selectedTime = '近六个月'">近六个月</el-dropdown-item>
                <el-dropdown-item command="近一年" @click="selectedTime = '近一年'">近一年</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="results">
          <div class="result" v-for="(result, index) in results" :key="index">
            <span class="result-number">{{ index + 1 }}</span>
            <span class="result-name">{{ result.name }}</span>
            <div class="star-wrapper">
              <el-icon v-for="(starIndex, i) in 5" :key="i">
                <Star :class="{
                  'gold-star': i < Math.floor(result.score),
                  'half-star': i === Math.floor(result.score) && result.score % 1 >= 0.1,
                  'gray-star': i >= Math.ceil(result.score)
                }" />
              </el-icon>
            </div>
            <span class="result-score">{{ result.score }} 分</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>

import { ref, onMounted } from 'vue'
import { Calendar, ArrowDown, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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
});


// 模拟数据
const totalCount = ref('601,986');
const patentCount = ref('370,221');
const paperCount = ref('180,596');
const othersCount = ref('51,168');
const patentRatio = ref(0.615);
const paperRatio = ref(0.3);
const othersRatio = ref(0.085);

</script>
  
<style scoped>
.container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top-section {
  height: 150px;
  background-color: gold;
}

.stats-container {
  height: 100px;
  background-color: pink;
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

.bottom-section {
  height: 225px;
  display: flex;
  gap: 10px;
}

.bottom-left {
  flex: 1;
  background-color: lightblue;
}

.bottom-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

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
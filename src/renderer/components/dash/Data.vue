<!-- <template>
    <div>
        新页面
    </div>
</template>


<script setup>

</script>

<style lang="css" scoped>


</style> -->


<template>
    <el-container>
      <!-- 左侧导航 -->
      <el-aside width="200px" class="sidebar">
        <el-menu :default-active="activeMenu" class="el-menu-vertical">
          <el-menu-item v-for="item in menuList" :key="item.name" :index="item.name">
            <i :class="item.icon"></i>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
  
      <!-- 内容区域 -->
      <el-container>
        <!-- 顶部工具栏 -->
        <el-header class="header">
          <div class="header-left">导航/系统首页</div>
          <div class="header-right">
            <el-avatar icon="el-icon-user-solid"></el-avatar>
            <span>admin</span>
          </div>
        </el-header>
  
        <!-- 主内容 -->
        <el-main class="content">
          <el-row :gutter="20">
            <!-- 数据统计卡片 -->
            <el-col :span="6" v-for="(stat, index) in statistics" :key="index">
              <el-card>
                <h3>{{ stat.title }}</h3>
                <p>今日：{{ stat.today }}</p>
                <p>昨日：{{ stat.yesterday }}</p>
              </el-card>
            </el-col>
          </el-row>
  
          <el-row :gutter="20" class="chart-row">
            <!-- 环形图 -->
            <el-col :span="8">
              <div id="pieChart" class="chart"></div>
            </el-col>
  
            <!-- 柱状图 -->
            <el-col :span="16">
              <div id="barChart" class="chart"></div>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import * as echarts from "echarts";
  
  export default {
    name: "Dashboard",
    setup() {
      const activeMenu = ref("系统首页");
      const menuList = ref([
        { name: "系统首页", title: "系统首页", icon: "el-icon-house" },
        { name: "成果模板", title: "成果模板", icon: "el-icon-document" },
        { name: "成果信息", title: "成果信息", icon: "el-icon-folder" },
        { name: "成果审核", title: "成果审核", icon: "el-icon-check" },
        { name: "知识产权", title: "知识产权", icon: "el-icon-lock" },
        // 其他菜单...
      ]);
  
      const statistics = ref([
        { title: "今日访问量", today: 67, yesterday: 569 },
        { title: "新闻用户", today: 45, yesterday: 366 },
        { title: "论文数据", today: 180, yesterday: 366 },
        { title: "系统总量", today: 5639, yesterday: 5530 },
      ]);
  
      const initPieChart = () => {
        const pieChart = echarts.init(document.getElementById("pieChart"));
        const options = {
          tooltip: { trigger: "item" },
          legend: { bottom: "0" },
          series: [
            {
              name: "成果类型",
              type: "pie",
              radius: "50%",
              data: [
                { value: 370221, name: "专利" },
                { value: 180596, name: "论文" },
                { value: 51168, name: "其他" },
              ],
            },
          ],
        };
        pieChart.setOption(options);
      };
  
      const initBarChart = () => {
        const barChart = echarts.init(document.getElementById("barChart"));
        const options = {
          xAxis: { type: "category", data: ["1月", "2月", "3月", "4月", "5月", "6月"] },
          yAxis: { type: "value" },
          series: [
            {
              data: [820, 932, 901, 934, 1290, 1330],
              type: "bar",
            },
          ],
        };
        barChart.setOption(options);
      };
  
      onMounted(() => {
        initPieChart();
        initBarChart();
      });
  
      return {
        activeMenu,
        menuList,
        statistics,
      };
    },
  };
  </script>
  
  <style scoped>
  .sidebar {
    background-color: #f5f5f5;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    background-color: #fff;
    border-bottom: 1px solid #ddd;
  }
  
  .content {
    padding: 20px;
    background-color: #f9f9f9;
  }
  
  .chart-row {
    margin-top: 20px;
  }
  
  .chart {
    height: 300px;
    background-color: #fff;
    padding: 10px;
  }
  </style>
  
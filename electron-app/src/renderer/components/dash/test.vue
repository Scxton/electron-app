<template>

    <el-row :gutter="20">
      <el-col :span="3" :offset="0">
        <el-text tag="b">系统数据</el-text>
      </el-col>
      <el-col :span="3" :offset="12">
        <el-date-picker v-model="value1" type="date" placeholder="Pick a day" :size="small" />
      </el-col>
    </el-row>
  
  
    <el-row :gutter="20">
      <div class="grid-content ep-bg-purple" />
      <el-col :span="4">
        <div class="statistic-card">
          <el-statistic :value="985">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                今日
                <el-tooltip effect="dark" content="Number of users who logged into the product in one day"
                  placement="top">
                  <!-- <el-icon style="margin-left: 4px" :size="12">
                    <Warning />
                  </el-icon> -->
                </el-tooltip>
              </div>
            </template>
          </el-statistic>
          <div class="statistic-footer">
            <div class="footer-item">
              <span>同比上周</span>
              <span class="red">
                24%
                <el-icon>
                  <CaretTop />
                </el-icon>
              </span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="statistic-card">
          <el-statistic :value="693">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                昨日
                <el-tooltip effect="dark" content="Number of users who logged into the product in one month"
                  placement="top">
                  <!-- <el-icon style="margin-left: 4px" :size="12">
                    <Warning />
                  </el-icon> -->
                </el-tooltip>
              </div>
            </template>
          </el-statistic>
          <div class="statistic-footer">
            <div class="footer-item">
              <span>同比上周</span>
              <span class="red">
                12%
                <el-icon>
                  <CaretTop />
                </el-icon>
              </span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="statistic-card">
          <el-statistic :value="720" title="New transactions today">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                新用户
              </div>
            </template>
          </el-statistic>
          <div class="statistic-footer">
            <div class="footer-item">
              <span>同比上周</span>
              <span class="green">
                16%
                <el-icon>
                  <CaretBottom />
                </el-icon>
              </span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="statistic-card">
          <el-statistic :value="366" title="New transactions today">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                近7日
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="statistic-card">
          <el-statistic :value="563" title="New transactions today">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                近30日
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
    </el-row>
  
    <el-row :gutter="20">
      <el-col :span="4">
        <div class="statistic-card">
          <el-statistic :value="601986">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                成果库总数
                <el-tooltip effect="dark" content="Number of users who logged into the product in one day"
                  placement="top">
                </el-tooltip>
              </div>
            </template>
          </el-statistic>
        </div>
      </el-col>
      <el-col :span="4">
        <el-progress type="circle" :percentage="61.5" :color="success" />
      </el-col>
      <el-col :span="2">
        <el-statistic :value="370221">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              专利
              <el-tooltip effect="dark" content="Number of users who logged into the product in one day" placement="top">
                <!-- <el-icon style="margin-left: 4px" :size="12">
                    <Warning />
                  </el-icon> -->
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
        <div class="statistic-footer">
          <div class="footer-item">
            <span>占比</span>
            <span>61.5%</span>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <el-progress type="circle" :percentage="30" :color="warning" />
      </el-col>
      <el-col :span="2">
        <el-statistic :value="180596">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              论文
              <el-tooltip effect="dark" content="Number of users who logged into the product in one day" placement="top">
                <!-- <el-icon style="margin-left: 4px" :size="12">
                    <Warning />
                  </el-icon> -->
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
        <div class="statistic-footer">
          <div class="footer-item">
            <span>占比</span>
            <span>30%</span>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <el-progress type="circle" :percentage="85" :color="warning" />
      </el-col>
      <el-col :span="2">
        <el-statistic :value="51168">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              其他
              <el-tooltip effect="dark" content="Number of users who logged into the product in one day" placement="top">
                <!-- <el-icon style="margin-left: 4px" :size="12">
                    <Warning />
                  </el-icon> -->
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
        <div class="statistic-footer">
          <div class="footer-item">
            <span>占比</span>
            <span>85%</span>
          </div>
        </div>
      </el-col>
    </el-row>
  
  
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue'
  import {
    ArrowRight,
    CaretBottom,
    CaretTop,
    Warning,
  } from '@element-plus/icons-vue'
  
  const value1 = ref('')
  
  </script>
  
  <style scoped>
  :global(h2#card-usage ~ .example .example-showcase) {
    background-color: var(--el-fill-color) !important;
  }
  
  .el-statistic {
    --el-statistic-content-font-size: 28px;
  }
  
  .statistic-card {
    height: 100%;
    padding: 20px;
    border-radius: 4px;
    background-color: var(--el-bg-color-overlay);
  }
  
  .statistic-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    font-size: 12px;
    color: var(--el-text-color-regular);
    margin-top: 16px;
  }
  
  .statistic-footer .footer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .statistic-footer .footer-item span:last-child {
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
  }
  
  .green {
    color: var(--el-color-success);
  }
  
  .red {
    color: var(--el-color-error);
  }
  
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  
  .demo-progress .el-progress--circle {
    margin-right: 15px;
  }
  </style>
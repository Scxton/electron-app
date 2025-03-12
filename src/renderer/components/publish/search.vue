<template>
  <div class="achievements-container">
    <!-- 未审核成果部分 -->
    <div class="unaudited-achievements">
      <h2>待审核成果列表</h2>
      <div v-if="unauditedLoading">加载中...</div>
      <div v-else-if="unauditedError">
        错误信息: {{ unauditedError }}
        <button @click="fetchUnauditedAchievements">重试</button>
      </div>
      <div v-else>
        <div class="debug-info">
          待审核成果数量: {{ unauditedAchievements.length }}
        </div>
        <ul v-if="unauditedAchievements.length">
          <li v-for="achievement in unauditedAchievements" :key="achievement.id" class="achievement-item">
            <div class="achievement-name">{{ achievement.achievementName }}</div>
            <div class="achievement-details">
              <span>类别: {{ achievement.achievementCategory }}</span>
              <span>版本: {{ achievement.achievementVersion }}</span>
            </div>
            <div class="debug-info">
              ID: {{ achievement.id }} | 
              审核状态: {{ achievement.auditFlag === 0 ? '未审核' : '已审核' }}
            </div>
          </li>
        </ul>
        <div v-else>暂无待审核的成果</div>
      </div>
    </div>

    <!-- 所有成果部分 -->
    <div class="all-achievements">
      <h2>所有成果列表</h2>
      <div v-if="allLoading">加载中...</div>
      <div v-else-if="allError">
        错误信息: {{ allError }}
        <button @click="fetchAllAchievements">重试</button>
      </div>
      <div v-else>
        <div class="debug-info">
          总成果数量: {{ allAchievements.length }}
        </div>
        <ul v-if="allAchievements.length">
          <li v-for="achievement in allAchievements" :key="achievement.id" class="achievement-item">
            <div class="debug-info">完整对象: {{ achievement }}</div>
            <div class="achievement-name">
              {{ achievement.achievementName || '无名称' }}
            </div>
            <div class="achievement-details">
              <span>类别: {{ achievement.achievementCategory }}</span>
              <span>版本: {{ achievement.achievementVersion }}</span>
            </div>
            <div class="debug-info">
              ID: {{ achievement.id }} | 
              审核状态: {{ achievement.auditFlag === 0 ? '未审核' : '已审核' }}
            </div>
          </li>
        </ul>
        <div v-else>暂无成果</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUnauditedAchievements, getAllAchievements } from '../../api/search'

// 未审核成果相关
const unauditedAchievements = ref([])
const unauditedLoading = ref(true)
const unauditedError = ref(null)

// 所有成果相关
const allAchievements = ref([])
const allLoading = ref(true)
const allError = ref(null)

const fetchUnauditedAchievements = async () => {
  try {
    unauditedLoading.value = true
    console.log('Fetching unaudited achievements...')
    const response = await getUnauditedAchievements()
    console.log('Unaudited achievements response:', response)
    
    if (response && Array.isArray(response)) {
      unauditedAchievements.value = response
      console.log('Unaudited achievements data:', response)
      console.log('Number of unaudited achievements:', response.length)
    } else {
      unauditedError.value = '数据格式不正确'
      console.error('Invalid response format')
    }
  } catch (err) {
    unauditedError.value = '获取未审核数据失败'
    console.error('Error fetching unaudited achievements:', err)
  } finally {
    unauditedLoading.value = false
  }
}

const fetchAllAchievements = async () => {
  try {
    allLoading.value = true
    console.log('Fetching all achievements...')
    const response = await getAllAchievements()
    console.log('完整的API响应:', response)
    
    if (response && Array.isArray(response)) {
      allAchievements.value = response
      console.log('All achievements data:', response)
      console.log('Total number of achievements:', response.length)
    } else {
      allError.value = '数据格式不正确'
      console.error('Invalid response format')
    }
  } catch (err) {
    allError.value = '获取所有成果数据失败'
    console.error('Error fetching all achievements:', err)
  } finally {
    allLoading.value = false
  }
}

onMounted(() => {
  console.log('Component mounted, starting data fetch...')
  fetchUnauditedAchievements()
  fetchAllAchievements()
})
</script>

<style scoped>
.achievements-container {
  display: flex;
  gap: 40px;
  padding: 20px;
}

.unaudited-achievements,
.all-achievements {
  flex: 1;
  min-width: 0;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

ul {
  list-style: none;
  padding: 0;
}

.achievement-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.achievement-item:hover {
  background-color: #f9f9f9;
}

.achievement-name {
  font-size: 1.1em;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.achievement-details {
  font-size: 0.9em;
  color: #666;
  display: flex;
  gap: 20px;
  margin: 5px 0;
}

.debug-info {
  font-size: 0.8em;
  color: #999;
  background-color: #f5f5f5;
  padding: 5px;
  margin-top: 5px;
  border-radius: 4px;
}

button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #45a049;
}
</style>

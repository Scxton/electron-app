<template>
  <header class="header">
    <div class="header-left">
      <h2>成果管理服务平台</h2>
    </div>
    <div class="header-right">
      <el-avatar size="medium" :icon="UserFilled"></el-avatar>
      <el-dropdown>
        <span class="el-dropdown-link">
          {{ username }} <el-icon>
            <CaretBottom />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">注销</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>

  <!-- 确认对话框 -->
  <el-dialog title="确认" v-model="dialogVisible" width="30%">
    <span>确定要注销登录吗？</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmLogout">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { UserFilled, CaretBottom } from '@element-plus/icons-vue';
import { logoutTest } from '../../api/logout';
import { loginTest } from '../../api/login';

const router = useRouter();
const dialogVisible = ref(false);
const username = ref('用户');

// 获取用户信息
const getUserInfo = async () => {
  try {
    // First check if username is in localStorage
    const storedUsername = localStorage.getItem('username');

    console.log('storedUsername', storedUsername);
    if (storedUsername) {
      username.value = storedUsername;
      return;
    }

    // If not in localStorage, try to get from API
    const response = await loginTest();
    console.log('获取用户信息成功:', response);
    if (response && response.data && response.data.username) {
      username.value = response.data.username;
      // Store for future use
      localStorage.setItem('username', response.data.username);
    }
    console.log('username11111111111111:', username.value);
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 组件挂载时获取用户信息
onMounted(() => {
  getUserInfo();
});

const handleLogout = () => {
  dialogVisible.value = true;
};


const confirmLogout = () => {
  // 从本地存储获取用户信息
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('username');

  console.log('userId222222222222:', userId);
  console.log('userName22222222222:', userName);
  logoutTest(userId, userName)
    .then(() => {
      // 清除本地存储的用户信息
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
      ElMessage.success('注销成功');
      router.push('/login');
    })
    .catch(error => {
      ElMessage.error('注销失败：' + error.message);
    })
    .finally(() => {
      dialogVisible.value = false;
    });
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  /* 白色底色 */
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
  /* 阴影 */
  padding: 10px 20px;
}

.header-left {
  font-size: 14px;
  color: #3372be;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-right span {
  margin-left: 10px;
}

.el-dropdown {
  margin-left: 10px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
}

.el-dropdown-link:hover {
  color: #66b1ff;
}

.el-icon-caret-bottom {
  margin-left: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

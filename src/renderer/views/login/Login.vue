<script setup>
import { reactive, ref } from 'vue'
import { ruleName, rulePassword } from '../../api/validdata'
import { loginTest, queryUserByName } from '../../api/login'
import { registerUser, getRoleById, queryAllRoles } from '../../api/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { setToken } from "../../http/token"
// router钩子，返回路由器实例
const router = useRouter()

// const { ipcRenderer } = window.electron;

const loginForm = reactive({
  userName: '',
  password: '',
  remember: false
})

const rules = ref({
  userName: [{ validator: ruleName, trigger: 'blur' }],
  password: [{ validator: rulePassword, trigger: 'blur' }]
})

const loginFormRef = ref(null)

// Add registration dialog state
const registerDialogVisible = ref(false)

// Add registration form data
const registerForm = reactive({
  userName: '',
  password: '',
  confirmPassword: '',
  roleId: null,
  userIntro: '',
  applicationTime: ''
})

// Add registration form rules
const registerRules = ref({
  userName: [{ validator: ruleName, trigger: 'blur' }],
  password: [{ validator: rulePassword, trigger: 'blur' }],
  confirmPassword: [
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  roleId: [
    { 
      validator: (rule, value, callback) => {
        console.log("验证roleId:", value, typeof value);
        if (value === null || value === undefined || value === '') {
          callback(new Error('请选择角色'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
  userIntro: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
})

const registerFormRef = ref(null)

// Add new function for querying users
const queryUser = async (username) => {
  try {
    console.log('Querying user:', username);
    const response = await queryUserByName(username);
    console.log('Query results:', response);
    //将查询的respons中的userId保存下来
    localStorage.setItem('userId', response[0].userId);
    console.log('UserId saved to localStorage:', response[0].userId);
    ElMessage({
      message: '查询成功',
      type: 'success'
    });
    return response;
  } catch (error) {
    ElMessage({
      message: '查询失败',
      type: 'error'
    });
    console.error('Error querying user:', error);
  }
}

// Update submitForm to include query
const submitForm = (loginFormRef) => {
  loginFormRef.validate(async (valid) => {
    if (valid) {
      try {
        let token = await loginTest(loginForm.userName, loginForm.password)
        setToken("token", token)
        localStorage.setItem('username', loginForm.userName)

        // Query user information after successful login
        await queryUser(loginForm.userName);

        ElMessage({
          message: '登录成功',
          type: 'success'
        })
        router.push('/home')
      

        // ipcRenderer.send('user-login', loginForm.userName, localStorage.getItem('userId'))
      } catch (error) {
        ElMessage({
          message: '登录失败',
          type: 'error'
        })
      }
    } else {
      alert('error submit!!!')
      return false
    }
  })
}

// Add registration function
const handleRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 生成当前日期（yyyy-MM-dd）
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        registerForm.applicationTime = `${year}-${month}-${day}`;

        const userRolePermissions = {
          userName: registerForm.userName,
          userPwd: registerForm.password,
          roleId: registerForm.roleId,
          userIntro: registerForm.userIntro,
          applicationTime: registerForm.applicationTime
        };
        console.log('注册信息:', userRolePermissions);
        
        await registerUser(userRolePermissions);
        ElMessage({
          message: '已提交注册申请',
          type: 'success'
        });
        registerDialogVisible.value = false;
        // Clear form after successful registration
        registerForm.userName = '';
        registerForm.password = '';
        registerForm.confirmPassword = '';
        registerForm.roleId = null;
        registerForm.userIntro = '';
        registerForm.applicationTime = '';
      } catch (error) {
        ElMessage({
          message: '注册失败: ' + (error.message || '未知错误'),
          type: 'error'
        });
      }
    }
  });
}

// 添加角色列表状态
const roles = ref([]);

// 获取所有角色信息
const fetchRoles = async () => {
  try {
    const allRoles = await queryAllRoles();
    console.log('获取的所有角色信息:', allRoles);
    
    // 检查角色数据结构并适当转换
    if (Array.isArray(allRoles)) {
      // 将每个角色对象映射到正确的格式
      roles.value = allRoles.map(role => {
        // 深度打印角色对象结构，帮助调试
        console.log('角色对象结构:', JSON.stringify(role));
        
        // 处理不同的可能属性名
        const id = role.id || role.roleId || role.ID || (role.role && role.role.id);
        const name = role.roleName || role.name || role.rolename || (role.role && role.role.name);
        
        return {
          id: id,
          roleName: name
        };
      });
      
      // 再次输出处理后的角色列表
      console.log('处理后的角色列表:', roles.value);
    } else {
      console.error('返回的角色数据不是数组格式:', allRoles);
    }
  } catch (error) {
    console.error('获取角色信息失败:', error);
    ElMessage({
      message: '获取角色信息失败',
      type: 'error'
    });
  }
}

// 当角色选择发生变化时的处理函数
const handleRoleChange = (value) => {
  console.log('选择的角色ID:', value, '类型:', typeof value);
  registerForm.roleId = value;
  debugFormValidation(); // 在选择角色后立即验证表单
}

// 打开注册对话框时获取角色信息
const openRegisterDialog = () => {
  registerDialogVisible.value = true;
  // 清空表单数据
  registerForm.userName = '';
  registerForm.password = '';
  registerForm.confirmPassword = '';
  registerForm.roleId = null;
  registerForm.userIntro = '';
  fetchRoles();
  
  // 添加表单验证调试
  if (registerFormRef.value) {
    registerFormRef.value.clearValidate();
    console.log('表单验证规则:', registerRules.value);
  }
}

// 增加表单验证调试函数
const debugFormValidation = () => {
  console.log('当前表单值:', {
    userName: registerForm.userName,
    password: registerForm.password,
    confirmPassword: registerForm.confirmPassword,
    roleId: registerForm.roleId,
    userIntro: registerForm.userIntro
  });
  
  if (registerFormRef.value) {
    registerFormRef.value.validate(valid => {
      console.log('表单验证结果:', valid);
    });
  }
}
</script>

<template>
  <div class="login-container">
    <!-- 左侧登录表单 -->
    <div class="login-form">
      <h1>CETC32</h1>
      <h2>成果管理服务平台</h2>
      <!-- <img :src="myimg" /> -->
      <p>欢迎回来！</p>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="0px">
        <el-form-item prop="userName">
          <el-input v-model="loginForm.userName" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <a class="forgot-password" href="#">忘记密码？</a>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(loginFormRef)">登录</el-button>
          <el-button type="text" @click="openRegisterDialog">注册</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 右侧图像展示 -->
    <div class="login-image">
      <img src="../../assets/radar.png" class="responsive-image" center no-repeat />
    </div>
  </div>

  <!-- Registration Dialog -->
  <el-dialog v-model="registerDialogVisible" title="用户注册" width="30%">
    <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="80px">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="registerForm.userName" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
      </el-form-item>
      <el-form-item label="申请角色" prop="roleId">
        <el-select 
          v-model="registerForm.roleId" 
          placeholder="请选择角色"
          @change="handleRoleChange">
          <el-option 
            v-for="role in roles" 
            :key="role.id" 
            :label="role.roleName" 
            :value="role.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户描述" prop="userIntro">
        <el-input 
          v-model="registerForm.userIntro" 
          type="textarea" 
          :rows="3" 
          placeholder="请输入用户描述（选填）">
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="registerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRegister">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  flex: 1;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fff;
}

.login-form h1 {
  color: #e74c3c;
  font-size: 32px;
}

.login-form h2 {
  color: #2c3e50;
  margin: 10px 0 20px;
}

.login-form p {
  color: #aaa;
  margin-bottom: 30px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-button {
  width: 100%;
}

.forgot-password {
  float: right;
  font-size: 14px;
  color: #3498db;
}

.login-image {
  flex: 1;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* .login-image img {
  max-width: 100%;
  max-height: 120%;
  object-fit: cover;
  background-size: cover;
} */

/* 右侧图片容器 */
.image-container {
  flex: 1;
  /* 右侧区域占 1/2 */
  overflow: hidden;
  /* 隐藏溢出的部分 */
}

/* 图片自适应 */
.responsive-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-size: cover;
}
</style>

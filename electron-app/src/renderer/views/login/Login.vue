<script setup>
import { reactive, ref } from 'vue'
import { ruleName, rulePassword } from '../../api/validdata'
import { loginTest } from '../../api/login'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { setToken } from "../../http/token"
// router钩子，返回路由器实例
const router = useRouter()

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
const submitForm = (loginFormRef) => {
  loginFormRef.validate(async (valid) => {
    if (valid) {
      //console.log("loginForm = ", loginForm)
      console.log('loginForm.userName = ', loginForm.userName)
      console.log('loginForm.password = ', loginForm.password)
       let token = await loginTest(loginForm.userName, loginForm.password)
       setToken("token", token)
      ElMessage({
        message: '登录成功',
        type: 'success'
      })
      router.push('/home')
    } else {
      alert('error submit!!!')
      return false
    }
  })
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
          <el-button type="text">注册</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 右侧图像展示 -->
    <div class="login-image">
      <img src="../../assets/radar.png" class="responsive-image" center no-repeat />
    </div>
  </div>
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

<!-- <template>
  <div class="header">
    <el-header>
      <div class="title">成果管理服务平台</div>
      <div>{{ name }}</div>
    </el-header>
  </div>
</template>

<script>
export default {
  data() {
    return {
      
    }
  }
  // created() {
  //     this.name = loginForm('username')
  // }
}
</script>

<style lang="scss" scoped>
.header {
  .el-header {
    background: #ffffff;
    color: #136db1;
    line-height: 60px;
    // height: 52px;
    display: flex;
    justify-content: space-between;
    .title {
      width: 200px;
      font-size: 22px;
      
    }
  }
}
</style> -->



<template>
  <header class="header">
    <div class="header-left">
      <h2>成果管理服务平台</h2>
    </div>
    <div class="header-right">
      <el-avatar size="medium" icon="el-icon-user"></el-avatar>
      <span>admin</span>
    </div>
  </header>
</template>

<script>
export default {
  name: "Header",
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff; /* 白色底色 */
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1); /* 阴影 */
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
</style>

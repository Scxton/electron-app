<template>
  <div class="menu">
    <el-aside width="180px">
      <el-menu
        router
        default-active="2"
        class="el-menu-vertical-demo"
        background-color="#ffffff"
        text-color="#000000"
        active-text-color="#ffd04b"
        @open="handleOpen"
        @close="handleClose"
      >
        <template v-for="(item, index) in menus">
          <el-sub-menu v-if="!item.hidden" :key="index" :index="index + ''">
            <template #title>
              <i :class="item.iconClass"></i>
              <span>{{ item.name }}</span>
            </template>
            <el-menu-item-group v-for="(child, index) in item.children" :key="index">
              <el-menu-item :index="child.path">
                <i :class="child.iconClass"></i>
                {{ child.name }}
              </el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menus: []
    }
  },
  created() {
    console.log(this.$router.options.routes)
    this.menus = [...this.$router.options.routes]
    console.log('this.menus = ', this.menus)
    for (var i = 0; i < this.menus.length; i++) {
      console.log(this.menus[i])
    }
  }
}
</script>

<style lang="scss" scoped>
.menu {
  .el-aside {
    height: 100%;

    .el-menu {
      height: 100%;

      .fa {
        margin-right: 10px;
      }
    }

    .el-submenu .el-menu-item {
      min-width: 0;
    }
  }
}
</style>

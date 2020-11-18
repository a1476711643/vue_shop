<template>
    <!-- 这里要单独写类名的原因是里面也有一个container -->
    <el-container class="home-container"> 
        <el-header>
            <div>
                <img src="../assets/icon.jpg" alt="">
                <span>某网站后台管理系统</span>
            </div>
             <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主题区域 -->
        <el-container>
            <!-- 侧边栏 element-ui NavMenu -->
            <el-aside :width="isCollapse ? 64+'px':200+'px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单区 -->
            <el-menu
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409EFF"
      
      :unique-opened="true"
      :collapse="isCollapse" 
      :collapse-transition = "false"
      :router="true" :default-active="activePath"     
      >
        <!-- 意思：只能展开一项 -->
        <!-- 如果不加冒号，那么他会认为"true"只是一个单纯的字符串，而不是布尔值。 -->

        <!-- router 开启路由模式 以index作路由地址 -->
        <!-- unique-opened 默认只能有一个子菜单展开 -->
        <!-- collapse 开启折叠面板 transition 显示折叠动画 默认 true  -->
        <!-- default-active 默认高亮。 之前写了data保存了一波激活地址，那么就换冒号作变量值带进去吧 -->

    <!-- 一级菜单 -->
            <!-- 这里 如果index 为1的话，因为是循环，所有的循环 这个inedx都是1 所以会一起打开 -->
            <!--  正好id是唯一性标识，我们要绑定数据的话得先在字段前面加:（冒号） 然后双引号和键值 -->
            <!-- 会报错是因为这个index只接收字符串 只要改成字符串就好了。（隐式转换 +"" )-->
      <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
          <!-- 一级菜单的模板区域 -->
        <template slot="title">
          <!-- 图标 -->
          <i :class="item.iconname"></i>
          <!-- 文本 -->
          <span>{{item.authName}}</span>
        </template>
        <!-- 二级菜单 -->
            <!-- 记得冒号。 -->
            <!-- 以index为路由地址的话，咱们就用path 正好后台也有，记得补全一个/ -->
        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
            <template slot="title">
            <!-- 图标 -->
            <i class="el-icon-menu"></i>
            <!-- 文本 -->
            <span>{{subItem.authName}}</span>
            </template>
        </el-menu-item>
      </el-submenu>
      
    </el-menu>
            </el-aside>
            <!-- main主体 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        data(){
            return {
                menulist:[],    //左侧菜单数据
                //不用了， 我后面自己在数据库加字段一起循环出来了。
                iconsObj:{
                },
                isCollapse: false,  //默认不折叠。
                activePath:'' //储存激活链接的地址路径，方便以后调用回来。
            }
        },
        //要一开始获取数据 一般都在created()中获取
        // 
        created(){
            this.getMenuList(),
            this.activePath = window.sessionStorage.getItem('activePath')
        },
        methods: {
            logout() {
                window.sessionStorage.clear();
                this.$router.push('/login')
                this.$message('退出成功O(∩_∩)O哈哈~')
            },
            async getMenuList(){
                const {data : res} =  await this.$http.get('menus'); //经典解构赋值和async 与await
                console.log(res);
                if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.menulist = res.data;
                console.log(this.menulist);
                
            },
            //点击按钮    切换菜单的折叠与展开
            toggleCollapse(){
                this.isCollapse = !this.isCollapse
            },
            //保存链接的激活状态
            saveNavState(activePath){
                window.sessionStorage.setItem('activePath',activePath);
                this.activePath = activePath;
            }
        },
    }
</script>

<style lang="less" scoped>
.home-container {
    height: 100%;
}
.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between; // flex布局，左右
    padding-left: 0; //清空左边留白
    align-items: center;  //不让按钮上下贴边 而是居中的一个效果
    color: #fff;
    font-size: 20px;
    > div{ //嵌套的写法，对里面的div进行flex布局
        display: flex;
        align-items: center; //让文本/内容居中
        span {
            margin-left: 23px;
        }
        
    }
    img{
        width: 50px;
        height: 50px;
    }
}
.el-aside {
    background-color: #333744;
    .el-menu{
          border-right: 0;   //不去掉的话，会有一点突出，具体可以取消了再来看左侧导航条。 这玩意应该是elementui自己带的。
        // width: 100%;  //这个也可以解决这个问题。
    }
}
.el-main {
    background-color: #eaedf1;
}
.iconfont {
    margin-right: 10px;
}
.toggle-button {
    background-color: #4A5064;
    color: #fff;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    letter-spacing:0.2em; //字体间距
    cursor: pointer;  //鼠标放上去变小手。
}

</style>
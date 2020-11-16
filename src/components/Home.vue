<template>
    <div>
    Home组件在这！
    <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
    methods: {
        logout(){
            window.sessionStorage.clear();
            this.$router.push('/login')
            this.$message('退出成功O(∩_∩)O哈哈~')
        }
    },
}
</script>

<style lang="less" scoped>

</style>
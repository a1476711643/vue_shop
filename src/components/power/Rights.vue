<template>
    <div>
        <!-- 面包屑导航区~ -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片展示 -->
        <el-card class="box-card">
            <!-- 指定数据 rightsList -->
            <el-table :data="rightsList" border stripe >
                <!-- 索引列  type是索引 label是标题-->
                <el-table-column type="index" label="#" align="center"></el-table-column>
                <el-table-column label="权限名称" prop="authName" align="center"></el-table-column>
                <el-table-column label="路径" prop="path" align="center"></el-table-column>
                <el-table-column label="权限等级" prop="level" align="center">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                        <el-tag type="success" v-else-if = "scope.row.level === '1'">二级</el-tag>
                        <el-tag type="warning" v-else-if = "scope.row.level === '2'">三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
          </el-card>
        <!-- 表格数据展示区 -->
        
    </div>
</template>

<script>
    export default {
        data(){
            return {
                // 权限列表
                rightsList:[],
            }
        },
        created() {
            this.getRightsList();
        },
        methods: {
            async getRightsList(){
                // list 代表我们要请求一个list的数据 api有写。
                const {data : res } = await this.$http.get('rights/list')
                console.log(res);
                if(res.meta.status !== 200) return this.$message.error('获取列表失败了∑(OAO”');
                this.rightsList = res.data;
                this.$message.success('获取权限列表数据成功φ(゜▽゜*)♪')
                
            }
        },
    }
</script>

<style lang="less" scoped>

</style>
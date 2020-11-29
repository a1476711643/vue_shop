<template>
    <div>
        <!-- 面包屑导航区~ -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <!-- 2.为Echarts 准备一个具备宽高的DOM -->
            <div id="main" style="width: 750px;height: 400px;"></div>
        </el-card>
    </div>
</template>

<script>
    // 1.导入echarts
    import echarts from 'echarts'
    import _ from 'lodash'
    export default {
        data() {
            return {
                // 需要合并的数据
                options: {
                    title: {
                        text: '用户来源'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#E9EEF3'
                            }
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            boundaryGap: false
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ]
                }
            }
        },
        created() {

        },
        // mounted 页面上的元素被渲染完毕的生命周期
        async mounted() {
            // 3.基于创建好的dom 初始化echarts实例
            const myChart = echarts.init(document.getElementById('main'));
            // 4.获取数据源
            const { data: res } = await this.$http.get('reports/type/1');
            if (res.meta.status !== 200) return this.$message.error('获取折线图数据失败');

            // 5.合并data 里的对象
            const result = _.merge(res.data,this.options);

            //6. 展示数据
            myChart.setOption(result)
        },
        methods: {

        },
    }
</script>

<style lang="less" scoped>

</style>
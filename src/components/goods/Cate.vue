<template>
    <div>
        <!-- 面包屑导航区~ -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>


            <!-- 表格区 -->
            <!-- data 是表格的数据表单 ：columns 是绑定的数据名称【label 是标题 prop 是数据名称 width 列的宽度 】   selectiontype 翻文档忘了   expandtype是左侧展开   show-index 显示索引
                index-text 是索引标题文本  border 边框线   show-row-hover鼠标悬停时的高亮效果   -->
            <tree-table :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index
                index-text="#" border :show-row-hover="false" class="treeTable">
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>

                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>

                <!-- 操作 -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                </template>

            </tree-table>

            <!-- 分页区 -->

            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类的对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
            <!-- 添加分类的表单 -->
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称:" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类:">
                    <!-- options 指定级联选择器的数据源 props 告诉我们用什么方式展开菜单 click 点击 hover 经过的时候 
                        v-model 必须为一个数组  -->
                    <el-cascader v-model="selectedKeys" :options="parentCateList" :props ="cascaderProps"
                        @change="parentCateChange" clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑分类的对话框 -->
        <el-dialog title="添加分类" :visible.sync="editCateDialogVisible" width="50%">
            <!-- 添加分类的表单 -->
            <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="100px">
                <el-form-item label="分类名称:" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>

</template>

<script>
    export default {
        data() {
            return {
                // 商品分类数据列表，默认为空
                catelist: [],
                // 查询条件
                queryInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                // 总数据条数
                total: 0,

                // 为table指定列的定义
                columns: [{
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    // 表示把当前列定义为「模板列」
                    type: 'template',
                    // 表示当前这一列使用的模板名称
                    template: 'isok',
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'order',
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'opt',
                },
                ],
                // 控制添加分类对话框的显示与隐藏
                addCateDialogVisible: false,
                // 添加分类表单的数据对象
                addCateForm: {
                    // 将要添加的分类的名称
                    cat_name: '',
                    // 父级分类id
                    cat_pid: 0,
                    // 分类等级 默认添加一级分类
                    cat_level: 0
                },
                // 添加分类表单的验证规则对象
                addCateFormRules: {
                    cat_name: [
                        { required: true, message: '请输入分类的名称', trigger: 'blur' },
                    ]
                },
                // 父级分类的列表
                parentCateList: [],
                // 指定级联选择器配置对象
                cascaderProps:{
                    value:'cat_id',
                    label:'cat_name',
                    children:'children',
                    expandTrigger: 'hover',
                    // 这个change-on-select属性现在已经弃用了  得在props里面加checkStrictly：true 就可以了
                    checkStrictly:true
                },
                // 选中的父级分类的id数组
                selectedKeys:{

                },
                editCateDialogVisible:false,
                editCateForm:{
                    cat_name:'',
                }


            }
        },
        created() {
            this.getCatelist()

        },
        methods: {
            // 获取商品分类数据
            async getCatelist() {
                const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
                if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
                // this.catelist = res.data;
                this.catelist = res.data.result;
                // console.log(res.data.result);
                this.total = res.data.total;
                this.$message.success('获取商品分类成功')
            },
            // 监听pagesize改变事件
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize;
                this.getCatelist();

            },
            // 监听pagenum的改变
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage;
                this.getCatelist();
            },
            // 点击按钮，展示添加分类的对话框
            showAddCateDialog() {
                // 获取父级分类的数据列表，在展示出对话框
                this.getParentCateList();
                this.addCateDialogVisible = !this.addCateDialogVisible;
            },
            // 获取父级分类的数据列表
            async getParentCateList() {
                const { data: res } = await this.$http.get('categories', {
                    params: {
                        type: 2
                    }
                })
                if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败啦(＃°Д°)');
                // console.log(res.data);
                this.parentCateList = res.data;

            },
            // 级联选择器选择项发生变化触发的函数
            parentCateChange(){
                console.log(this.selectedKeys);
                // 如果selectedKeys中的length > 0  证明选中了父级分类 反之，没有选中任何父级分类
                if(this.selectedKeys.length > 0){
                    // this.selectedKeys.length - 1 最后一项
                    // 父级分类的id
                    this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
                    // 为分类等级赋值
                    this.addCateForm.cat_level = this.selectedKeys.length;
                    return 
                }else{
                    this.addCateForm.cat_pid = 0;
                    
                    this.addCateForm.cat_level = 0;
                }
            },
            // 添加分类确定事件
            addCate(){
                /* 表单验证 别忘了是这么写的：this.$refs.表单的Ref.validate(vaild => {  是validate哦
                    if(!vaild) ...
                })
                */
                this.$refs.addCateFormRef.validate(async vaild => {
                    if(!vaild) return;
                    const {data : res } = await this.$http.post('categories',this.addCateForm);
                    if(res.meta.status !== 201) return this.$message.error('添加分类失败~(>_<)');
                    this.$message.success('添加分类成功o(*≥▽≤)ツ');
                    this.getCatelist();
                    this.addCateDialogVisible = !this.addCateDialogVisible;
                })
                console.log(this.addCateForm);
                
            },
            //  监听对话框关闭事件，    重置表单数据
            addCateDialogClosed(){
                // 除了要重置表单 还要把数组清空（级联选择器的selectedKeys）
                this.$refs.addCateFormRef.resetFields();
                this.selectedKeys = [];
                this.addCateForm.cat_level = 0;
                this.addCateForm.cat_pid = 0;
            },
            // 展示编辑的对话框
            async showEditDialog(row){
                // console.log(row);
                const{ data : res } = await this.$http.get(`categories/${row.cat_id}/`);
                if(res.meta.status !== 200) return this.$message.error('获取分类信息失败');
                this.editCateForm = res.data;
                this.editCateDialogVisible = !this.editCateDialogVisible;
            },
            //  编辑对话框点击确定的事件
            editCate(){
                this.$refs.editCateFormRef.validate(async vaild =>{
                    if(!vaild) return this.$message.error('请填写必填项！');
                    const {data:res} = await this.$http.put('categories/'+this.editCateForm.cat_id,{
                        cat_name:this.editCateForm.cat_name
                    })
                    if(res.meta.status !== 200) return this.$message.error('编辑分类失败');
                    this.$message.success('编辑分类名称成功！')
                    this.getCatelist();
                    this.editCateDialogVisible = !this.editCateDialogVisible;
                    
                })
            }
        },


    }
</script>

<style lang="less" scoped>
    .treeTable {
        margin-top: 20px;
    }
    .el-cascader {
        width: 100%;
    }
</style>
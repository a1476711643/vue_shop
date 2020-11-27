<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <!-- 头部的警告区域  closable 关闭按钮  show-icon 展示个图标 -->
            <el-alert title="注意：只允许为第三级分类设置相关参数∑( ° △ °|||)" type="warning" :closable="false" show-icon>
            </el-alert>

            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品的级联选择器 -->
                    <el-cascader v-model="selectedCateKeys" :options="catelist" :props="cateProps"
                        @change="handleChange"></el-cascader>
                </el-col>
            </el-row>

            <!-- tab页签区 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <!-- 添加参数的按钮 想识别没选三级菜单就不给用按钮 也可以在属性这么添加
                        :disabled="this.selectedCateKeys.length !== 3" -->
                    <el-button type="primary" :disabled="isBtnDisable" @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染tag标签 -->
                                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable
                                    @close="handleClosed(index,scope.row)">
                                    {{item}}
                                </el-tag>
                                <!-- 输入的文本框 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 添加的按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">

                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                    @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                    @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>

                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <!-- 添加属性的按钮 -->
                    <el-button type="primary" :disabled="isBtnDisable" @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染tag标签 -->
                                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable
                                    @close="handleClosed(index,scope.row)">
                                    {{item}}
                                </el-tag>
                                <!-- 输入的文本框 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 添加的按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                    @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                    @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>

                    </el-table>
                </el-tab-pane>
            </el-tabs>

        </el-card>

        <!-- 添加参数的对话框 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 添加参数的对话框 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数的对话框 -->
        <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 商品分类对象
                catelist: [],
                // 级联选择框的配置对象
                cateProps: {
                    expandTrigger: "hover",
                    // 指定选中的值
                    value: "cat_id",
                    // 指定看到的值
                    label: "cat_name",
                    // 指定父子节点的嵌套属性
                    children: "children"
                },
                // 级联选择框双向绑定到的数组
                selectedCateKeys: [],
                // 被激活的页签的名称
                activeName: "many",
                // 动态参数的数据
                manyTableData: [],
                onlyTableData: [],

                // 控制添加对话框的变量
                addDialogVisible: false,

                // 添加参数的表单数据对象
                addForm: {
                    attr_name: '',
                },
                // 添加表单的验证规则对象
                addFormRules: {
                    attr_name: [
                        { required: true, message: '请输入参数名称', trigger: 'blur' },
                    ]
                },
                // 编辑对话框的显示与隐藏
                editDialogVisible: false,
                // 修改参数的表单数据对象
                editForm: {
                    attr_name: '',
                },
                // 修改表单的验证规则
                editFormRules: {
                    attr_name: [
                        { required: true, message: '请输入参数名称', trigger: 'blur' },
                    ]
                },
                // // 控制Tag 按钮与文本框的切换显示
                // inputVisible:false,
                // // 文本框中输入的内容
                // inputValue:'',






            };
        },
        created() {
            this.getCateList();
        },
        methods: {
            async getCateList() {
                const { data: res } = await this.$http.get("categories");
                if (res.meta.status !== 200)
                    return this.$message.error("获取商品信息失败");
                this.catelist = res.data;
            },
            // 级联选择框选择项变化会触发的函数
            async handleChange() {
                // element级联选择器会自带 只能选择三级菜单的值，但是实际上二级菜单的值东西还是可以点，为了确保安全。
                this.getParamsData();

            },
            // tabs页签点击事件的处理函数
            handleTabClick() {
                console.log(this.activeName);
                this.getParamsData();
            },
            async getParamsData() {
                if (this.selectedCateKeys.length !== 3) {
                    this.selectedCateKeys = [];
                    this.manyTableData = [];
                    this.onlyTableData = [];
                    return;
                }
                // 根据所选分类的id 和 当前所处的面板 获取对应的参数
                const { data: res } = await this.$http.get(
                    `categories/${this.cateId}/attributes`,
                    {
                        params: {
                            sel: this.activeName
                        }
                    }
                );
                if (res.meta.status !== 200)
                    return this.$message.error("获取参数列表失败");
                res.data.forEach(item => {
                    // 用空格分隔获得到的数据
                    // 原本获取到的是一个字符串，经过for循环遍历后，这样就变成数组了。
                    // 先对attr_vals字符串做三元表达式判断，如果为空字符串返回一个空数组，如果不为空就按正常空格分割。
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
                    // 控制 文本框的 显示与隐藏
                    item.inputVisible = false;
                    item.inputValue = '';
                })
                if (this.activeName === "many") {
                    this.manyTableData = res.data;
                } else {
                    this.onlyTableData = res.data;
                }
            },
            // 监听添加对话框的关闭事件
            addDialogClosed() {
                this.$refs.addFormRef.resetFields();
            },
            // 添加对话框确定事件
            addParams() {
                this.$refs.addFormRef.validate(async vaild => {
                    if (!vaild) return this.$message.error('验证不通过');
                    const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName
                    });
                    console.log(res);

                    if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
                    this.$message.success('添加参数成功！')
                    this.addDialogVisible = !this.addDialogVisible;
                    this.getParamsData();
                })
            },
            // 重置编辑的表单
            editDialogClosed() {
                this.$refs.editFormRef.resetFields();
            },
            //  点击编辑按钮的事件
            async showEditDialog(attr_id) {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
                    params: {
                        attr_sel: this.activeName,
                    }
                })
                if (res.meta.status !== 200) return this.$message.error('请求失败')
                this.editForm = res.data;
                this.getParamsData();
                this.editDialogVisible = !this.editDialogVisible;
            },
            // 编辑表单的确定按钮事件
            editParams() {
                this.$refs.editFormRef.validate(async vaild => {
                    if (!vaild) return;
                    const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                        attr_name: this.editForm.attr_name,
                        attr_sel: this.activeName
                    })
                    if (res.meta.status !== 200) return this.$message.error('修改失败');
                    this.$message.success('修改成功');
                    this.getParamsData();
                    this.editDialogVisible = !this.editDialogVisible;
                })
            },
            // 根据id删除对应参数项
            async removeParams(attr_id) {
                const comfirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                // 用户取消删除操作
                console.log(comfirmResult);

                if (comfirmResult !== 'confirm') return this.$message.info('已取消删除');
                const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
                if (res.meta.status !== 200) return this.$message.error('删除失败');
                this.$message.success('删除成功');
                this.getParamsData();
            },

            // tag 文本框失去焦点/按下enter键 触发的函数
            async handleInputConfirm(row) {

                // 判断是否输入了空东西 trim 去除空格。
                if (row.inputValue.trim().length === 0) {
                    row.inputValue = '';
                    row.inputVisible = false;
                    return;
                }
                row.attr_vals.push(row.inputValue.trim())
                row.inputValue = ''
                // 显示回tag标签
                row.inputVisible = false;
                // 需要发起请求保存这次操作
                this.saveAttrVals(row);
            },
            // 将对 attr_vals 的操作 保存到数据库的函数
            async saveAttrVals(row) {
                //  需要发起请求 保存这次操作的函数
                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(' ')
                })
                if (res.meta.status !== 200) return this.$message.error('修改参数项失败');
                this.$message.success('修改参数项成功')

            },
            //  参数项添加的按钮的事件
            showInput(row) {
                row.inputVisible = true;
                // 文本框自动获得焦点
                // $nextTick 方法的作用 ：
                // 当页面上元素被重新渲染之后，才会执行回调函数中的代码
                // 简而言之，$nextTick 是页面元素被重新渲染后才会调用的回调函数
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },

            //  TAG标签点击X的事件 删除对应的参数可选项
            async handleClosed(index, row) {
                row.attr_vals.splice(index, 1);
                this.saveAttrVals(row);
            }

        },
        computed: {
            // 如果按钮需要被禁用，则返回true 反着false
            isBtnDisable() {
                if (this.selectedCateKeys.length !== 3) return true;
                return false;
            },
            // 当前选中的三级分类的id
            cateId() {
                if (this.selectedCateKeys.length === 3) return this.selectedCateKeys[2];
                return null;
            },
            // 动态计算标题文本
            titleText() {
                if (this.activeName === "many") {
                    return "动态参数";
                }
                return "静态属性";
            }
        }
    };
</script>

<style lang="less" scoped>
    .cat_opt {
        margin-top: 15px;
    }

    .el-tag {
        margin-right: 15px;
    }

    .input-new-tag {
        width: 120px;
    }
</style>
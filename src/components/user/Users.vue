<template>
    <div>
        <!-- 面包屑导航区~ -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->

        <el-card>
            <!-- 搜索与添加区域 -->
            <!-- el-row 包裹el-col ：gutter 参数为间距， ：span 参数为限制的长度 -->
            <el-row :gutter="25">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList()"
                        @input="getUserList()">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <!-- 控制显示还是隐藏的方法 -->
                    <el-button type="primary" @click="addDialogVisible = !addDialogVisible">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- prop 要渲染的字段名 label 标题名 :data 要渲染的字段的数组名 -->
            <el-table :data="userlist" border stripe>
                <!-- 索引列 -->
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column prop="username" label="姓名">
                </el-table-column>
                <el-table-column prop="email" label="邮箱">
                </el-table-column>
                <el-table-column prop="mobile" label="电话">
                </el-table-column>
                <el-table-column prop="role_name" label="角色">
                </el-table-column>
                <el-table-column prop="mg_state" label="状态">
                    <!-- slot-scope="scope" 可以直接渲染出 获取到的数值。 通过 作用域插槽 接受这个scope 那么就可以通过scope 点出row这个属性，这个就代表这一行的值。 -->
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>

                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-row>
                            <!-- 修改按钮  用插槽传参（scope row)-->
                            <el-button type="primary" icon="el-icon-edit" plain size="mini"
                                @click="showEditDialog(scope.row)">

                            </el-button>
                            <!-- 删除按钮 -->
                            <el-button type="danger" icon="el-icon-delete" plain size="mini"
                                @click="removeUserById(scope.row.id)"></el-button>
                            <!-- 提示信息 element-ui组件 -->
                            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                                <!-- 分配角色按钮 -->
                                <el-button type="warning" icon="el-icon-setting" plain size="mini"></el-button>
                            </el-tooltip>
                        </el-row>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 这是分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" style="text-align : center">
            </el-pagination>

        </el-card>


        <!-- Dialog 提示对话框 添加用户的对话框 -->
        <!-- title 标题 visible.sync 控制显示和隐藏的变量  width 宽度 不多说  :before-close 在关闭的时候触发这个事件  close事件，关闭的时候触发  -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed()">
            <!-- 内容主体区 -->
            <!-- model 控制用户表单数据 rules 规则 ref 引用名称-->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <!-- prop 是 验证规则的属性。 -->
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部按钮区。 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser()">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户的对话框区域 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <!-- 主体区 -->

            <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
                <!-- prop 是 验证规则的属性。 -->
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser()">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>
<script>
    export default {
        data() {
            // 自定义 邮箱校验规则
            // rule 规则 value 要检验的值 callback 回调函数 成功了/失败了
            var checkEmail = (rule, value, callback) => {
                // 验证邮箱的正则表达式
                const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
                if (regEmail.test(value)) {
                    // 合法邮箱
                    return callback()
                }
                callback(new Error('请输入合法的邮箱'))
            }
            // 上面这个，千万不要加逗号。。

            // 自定义 手机校验规则
            var checkMobile = (rule, value, callback) => {
                // 验证手机号的 正则表达式
                const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
                if (regMobile.test(value)) {
                    return callback()
                }
                callback(new Error('请输入合法的手机号'))
            }

            return {
                queryInfo: {
                    query: '',
                    // 当前页数
                    pagenum: 1,
                    // 当前每页显示多少条数据
                    pagesize: 2
                },//参数字段要与后端一一对应
                userlist: [],
                total: 0,
                // 控制用户添加对话框的显示隐藏
                addDialogVisible: false,
                // 添加用户的表单数据
                addForm: {
                    id: '',
                    username: '',
                    password: '',
                    email: '',
                    mobile: '',
                },

                // 添加用户表单的验证对象
                addFormRules: {
                    username: [
                        // required 带星号。 message 提示信息 trigger 触发模式。 min 最小 max 最大 
                        { required: true, message: '请输入用户名', trigger: 'blur' },
                        { min: 3, max: 10, message: '用户名长度在3~10个字符之间', trigger: 'blur' },
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min: 6, max: 15, message: '密码长度在6~15个字符之间', trigger: 'blur' },
                    ],
                    email: [
                        { required: true, message: '请输入邮箱', trigger: 'blur' },
                        { validator: checkEmail, trigger: 'blur' }
                    ],
                    mobile: [
                        { required: true, message: '请输入手机', trigger: 'blur' },
                        { validator: checkMobile, trigger: 'blur' }
                    ]
                },
                // 控制修改用户对话框变量
                editDialogVisible: false,
                editForm: {
                    username: '',
                    password: '',
                    email: '',
                    mobile: ''
                }
            }
        },
        created() {
            this.getUserList();
        },
        methods: {
            async getUserList() {
                const { data: res } = await this.$http.get('users', {
                    params: this.queryInfo,
                })

                console.log("--------------getUserList方法里的Users打印信息-----------------");
                console.log(res);
                if (res.meta.status !== 200) return this.$message.error('User获取错误啦！o(╥﹏╥)o')
                this.userlist = res.data.users;  //获取到的用户数据保存
                this.total = res.data.total;  //页码保存
            },
            // 监听pagesize 改变的事件
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize;
                this.getUserList();

            },
            // 监听 pagenum 改变的事件
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage;
                this.getUserList();
            },
            // 监听switch 开关状态改变
            async userStateChanged(userinfo) {
                // 根据文档 知道修改用户数据要用put请求。 模板字符串直接套参数进去。  老方法 async await  const解构赋值拿出来。
                const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`);  //千万记得删了冒号，不然 会识别为 字符串。
                console.log('------------------监听开关的数据------------------');
                // console.log(userinfo.id);
                console.log(res);
                // 虽然显示 是失败了，但是我们已经把页面上的false改成 true了 ( 上面的代码) 所以为了不让他成功，我们失败后取反一波。
                if (res.meta.status !== 200) {
                    userinfo.mg_state = !userinfo.mg_state;
                    return this.$messgae.error('开关更新失败了！w(ﾟДﾟ)w')
                }
                this.$message.success('开关更新成功啦〃\'A\'〃');
            },
            // 监听对话框关闭事件，重置表单
            // 需要先找到 ref的引用，通过这个引用调用resetFields方法就好。
            addDialogClosed() {
                this.$refs.addFormRef.resetFields();
            },
            // 添加用户 确定事件
            addUser() {
                // vaildate 表单预校正的神方法
                // 额。。 有这个验证方法的时候 记得async 是加在 vaild 前面的。
                this.$refs.addFormRef.validate(async vaild => {
                    // console.log(vaild);
                    if (!vaild) return this.$message.error('好好检查你的数据是不是错了！(●￣(ｴ)￣●)'); //验证不对？ 回去！

                    // 通过的话，就调用接口添加上去 接口地址和方法看api addForm 前面用：model 绑定的addForm 就是在这里 排上用场的。 输入的数据直接绑定在这了。
                    //  老三套 await async const{data}
                    const { data: res } = await this.$http.post('users', this.addForm)
                    if (res.meta.status !== 201) return this.$message.error('添加失败！咋回事呢(●￣(ｴ)￣●)');
                    this.$message.success('芜湖！添加成功！∑(⊙▽⊙');


                    // 别忘了隐藏对话框。
                    this.addDialogVisible = false;
                    //重新拿一下数据吧
                    this.getUserList();

                })
            },
            // 展示编辑用户的对话框
            async showEditDialog(row) {

                // console.log(row);
                const { data: res } = await this.$http.get(`users/${row.id}`)
                console.log(res);
                if (res.meta.status !== 200) return this.$message.error('修改失败！根本查不到！(*￣▽￣)y')
                this.editForm = res.data;
                this.editDialogVisible = !this.editDialogVisible;
            },
            // 修改用户提交方法
            editUser() {
                // 校验规则通过
                this.$refs.editFormRef.validate(async vaild => {
                    if (!vaild) return this.$message.error('修改失败！检查你的数据是否有误！(*￣(エ)￣)')
                    // 根据文档发送请求
                    const { data: res } = await this.$http.put('users/' + this.editForm.id, {
                        email: this.editForm.email,
                        mobile: this.editForm.mobile,
                    })
                    console.log('-------------editUser方法中的res---------------');
                    console.log(res);


                    if (res.meta.status !== 200) return this.$message.error('修改失败！我也不知道怎么回事！╮（╯＿╰）╭')
                    this.$message.success('修改成功！ヾ(@^▽^@)ノ')
                    // 隐藏，拿数据
                    this.editDialogVisible = !this.editDialogVisible;
                    this.getUserList()
                })
            },
            // 关闭后重置表单
            editDialogClosed() {
                this.$refs.editFormRef.resetFields();
            },

            // 根据id删除对应用户
            async removeUserById(id) {
                //  弹框询问用户是否删除数据
                const comfirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                // 如果用户删除成功，返回comfirm字符串。 
                // 取消删除 返回cancel
                console.log(comfirmResult);
                if (comfirmResult === 'cancel') {
                    return this.$message.info('取消删除成功*´∀`)´∀`)*´∀`)*´∀`)')
                }
                const { data: res } = await this.$http.delete('users/' + id)
                if(res.meta.status !== 200) return this.$message.error('删除失败！┐(ﾟ～ﾟ)┌')
                this.$message.success('删除成功！(￣▽￣")')
                // 重新获取数据
                this.getUserList();
            },
        },

    }
</script>

<style lang='less' scoped>

</style>
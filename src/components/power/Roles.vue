<template>
  <div>
    <!-- 面包屑导航区~ -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色的按钮 -->
      <el-button type="primary" @click="addRolesDialogVisible = !addRolesDialogVisible">添加角色</el-button>

      <!-- 表格数据展示区 -->
      <el-table :data="rolesList" border stripe>
        <!-- expand 显示一个 >  作用为展开行~  数据估计要 嵌套在里面才能生效吧 要拿数据 得先template 里的scope-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!--  -->
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级、三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染所有的二级权限 -->
                <!-- class 里 为了判断 第一个不用横线 使用三目运算符 为i2 的index 判断 为0（第一个） 就不添加 其他都添加。 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children"
                  :key="item2.id">
                  <!-- 左列 二级权限-->
                  <el-col :span="6">
                    <!-- closable  为标签渲染关闭按钮 -->
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                      {{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 右列 三级权限 -->
                  <el-col :span="18">
                    <!-- 为什么是item2 因为item2存放了 三级菜单权限 -->
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable
                      @close="removeRightById(scope.row, item3.id)">{{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" width="300px"
              @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <!-- EL树形控件 -->
      <!-- data 数据源 props 绑定字段  show-checkbox 为左侧添加框选属性  node-key 为每个树节点赋予一个唯一id值 这里的id 是数据源 rightsList.id 的意思  -->
      <!--  default-expand-all 默认展开所有节点 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
        :default-checked-keys="defKeys" ref="treeRef">
      </el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="editFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 角色列表数据
        rolesList: [],
        // 控制分配权限对话框的显示与隐藏
        setRightDialogVisible: false,
        // 存放分配权限对话框获取到的数据数组
        rightsList: [],
        // 树形控件的属性绑定对象
        treeProps: {
          // label 要看到的字段
          label: "authName",
          // 父子节点
          children: "children"
        },
        // 默认选中的节点id值数组
        defKeys: [],
        //   当前即将分配权限的角色的id
        roleId: "",
        editDialogVisible: false,
        // 编辑角色的存放数据的数组
        editForm: {
          roleName: '',
          roleDesc: ''
        },
        editFormRules: {
          roleName: [
            { required: true, message: '请输入角色名', trigger: 'blur' },
          ]
        },
        // 添加角色对话框显示的变量
        addRolesDialogVisible:false,
        addForm:{
          roleName:'',
          roleDesc:''
        }

      };
    },
    created() {
      this.getRolesList();
    },
    methods: {
      // 获取角色权限列表
      async getRolesList() {
        const { data: res } = await this.$http.get("roles");
        console.log(res);
        if (res.meta.status !== 200)
          return this.$message.error("获取角色列表失败~~");
        this.rolesList = res.data;
        this.$message.success("获取角色列表成功ヾ(◍°∇°◍)ﾉﾞ");
      },
      // 根据id在标签删除对应的权限
      async removeRightById(role, rightId) {
        // 弹框提示用户是否要删除
        const confirmResult = await this.$confirm(
          "此操作将永久删除该文件, 是否继续?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        ).catch(err => err);

        if (confirmResult !== "confirm")
          return this.$message.info("取消了删除权限操作");

        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        );

        if (res.meta.status !== 200) return this.$message.error("删除权限失败");

        this.$message.success("删除权限成功。");
        // 传回是最新的数据  也防止页面重新渲染
        role.children = res.data;
        // this.getRolesList()
      },

      // 展示分配权限的对话框 先定义一个role 这样递归三级节点才能有node 当前html也要有scope.row
      async showSetRightDialog(role) {
        // 重置defKeys显示的东西。
        this.defKeys = [];
        //   为点击确定分配权限的方法提供id
        this.roleId = role.id;
        // 获取到 所有权限的数据
        const { data: res } = await this.$http.get("rights/tree");

        if (res.meta.status !== 200)
          return this.$message.error("获取权限数据失败0.0");

        // 获取到的权限数据保存到data里的rightsList中
        this.rightsList = res.data;
        console.log(
          "-----------------------showSetRightDialog-------------------------"
        );
        console.log(role);

        //递归获取三级节点的id

        this.getLeafKeys(role, this.defKeys);

        this.setRightDialogVisible = !this.setRightDialogVisible;
      },
      // 通过递归形式，获取角色下所有三级权限的id，并保存到defkeys数组中
      getLeafKeys(node, arr) {
        // console.log(node.children);
        if (!node.children) {
          return arr.push(node.id);
        }

        //  如果不是三级权限 要继续递归节点
        node.children.forEach(item => this.getLeafKeys(item, arr));
      },
      // 监听分配权限对话框的关闭事件
      // setRightDialogClosed(){
      //     // 重置数组
      //     this.defKeys = [];
      // 实际上。。只要我一一打开这个方法 重置一下就好了 压根不用这么麻烦。
      // }

      // 点击确定为角色分配权限
      async allotRights() {
        const keys = [
          // 展开运算符 用于「合并数组」
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ];
        console.log(keys);
        //   以英文的',' 进行 每个元素的拼接
        const idStr = keys.join(",");
        const { data: res } = await this.$http.post(
          `roles/${this.roleId}/rights`,
          { rids: idStr }
        );
        if (res.meta.status !== 200)
          return this.$message.error("分配权限失败(>_<)");
        this.$message.success("分配权限成功~~~~~＞▽＜");
        this.getRolesList();
        this.setRightDialogVisible = !this.setRightDialogVisible;
      },
      // 展示编辑对话框
      async showEditDialog(row) {
        const { data: res } = await this.$http.get(`roles/${row.id}`)
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error('修改失败！根本查不到！(*￣▽￣)y')
        this.editForm = res.data;
        this.editDialogVisible = !this.editDialogVisible;
      },
      // 提交编辑角色对话框
      editRoles() {
        console.log(this.editForm);
        this.$refs.editFormRef.validate(async vaild => {
          if (!vaild) return this.$message.error('请填写必填项！')
          const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          })
          console.log(res);
          if (res.meta.status !== 200) return this.$message.error('编辑角色失败');
          this.$message.success('编辑角色成功！');
          this.editDialogVisible = !this.editDialogVisible;
          this.getRolesList();

        })
      },
      //  删除角色 以id
      async removeById(id) {
        const comfirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if (comfirmResult === 'cancel') return this.$message.info('取消删除成功！(＃°Д°)');
        const { data: res } = await this.$http.delete('roles/' + id);
        if (res.meta.status !== 200) return this.$message.error('删除角色失败');
        this.$message.success('删除成功！1(*^▽^*)1');
        this.getRolesList();
      },
      // 点击添加角色对话框事件
      addRoles() {
          this.$refs.addFormRef.validate(async vaild => {
            if(!vaild) return this.$message.error('请填写必填项！')
            const {data:res} = await this.$http.post('roles',{
              roleName:this.addForm.roleName,
              roleDesc:this.addForm.roleDesc
            })
            if(res.meta.status !== 201) return this.$message.error('添加角色失败！')
            this.$message.success('添加角色成功！O(∩_∩)O哈哈~');
            this.getRolesList();
            this.addRolesDialogVisible = !this.addRolesDialogVisible;

            
          })
      },
      // 添加角色监听关闭事件 重置表单
      addDialogClosed(){
        // 重置表单
        this.$refs.addFormRef.resetFields();
      }

    }
  };
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
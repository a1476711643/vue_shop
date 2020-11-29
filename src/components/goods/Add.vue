<template>
  <div>
    <!-- 面包屑导航区~ -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!-- 步骤条区域 -->
      <!-- el-tab 要的是字符串， 这里要的是数字， 通过隐式转换 -一个数字，就可以转换成数字。 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--  通过position 定位的 tab 标签栏 
                tab-position 传的是一个字符串， 为标签的方向-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="catelist" :props="catelistProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item1" v-for="(item1, index1) in item.attr_vals" :key="index1" border>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- element ui upload上传缩略图 -->
            <!-- action 图片要上传到的后台api地址 -->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture"
              :headers="headersObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce" />
            <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
  //导入lodash 官方建议以下划线进行接收
  import _ from "lodash";

  export default {
    data() {
      return {
        activeIndex: "0",
        // 添加商品的表单对象
        addForm: {
          goods_name: "",
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          // 商品所属的分类数组
          goods_cat: [],
          pics: [],
          // 商品详情描述
          goods_introduce: "",
          attrs: []
        },
        // 添加商品的表单验证规则对象
        // 在校验规则中在加入type:'number',绑定的model就能是空字符串了
        addFormRules: {
          goods_name: [
            { required: true, message: "请输入商品名称", trigger: "blur" }
          ],
          goods_price: [
            { required: true, message: "请输入商品价格", trigger: "blur" }
          ],
          goods_weight: [
            { required: true, message: "请输入商品重量", trigger: "blur" }
          ],
          goods_number: [
            { required: true, message: "请输入商品数量", trigger: "blur" }
          ],
          goods_cat: [{ required: true, message: "请选择商品分类" }]
        },
        // 放商品分类的数组
        catelist: [],
        // 级联选择器的props
        catelistProps: {
          expandTrigger: "hover",
          label: "cat_name",
          value: "cat_id",
          children: "children"
        },
        // many动态参数列表数据
        manyTableData: [],
        // only 静态属性列表数据
        onlyTableData: [],
        //   上传图片的url地址。
        uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
        //   图片上传组件headers请求头对象
        headersObj: {
          Authorization: window.sessionStorage.getItem("token")
        },
        //   预览图片的临时地址
        previewPath: "",
        previewDialogVisible: false
      };
    },
    created() {
      this.getCateList();
    },
    methods: {
      // 获取所有商品分类
      async getCateList() {
        const { data: res } = await this.$http.get("categories");
        if (res.meta.status !== 200)
          return this.$message.error("获取商品分类出错");
        this.catelist = res.data;
      },
      // 级联选择器 选中项变化触发的函数
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = [];
        }
      },
      // 将要切换标签页时触发的钩子函数
      beforeTabLeave(activeName, oldActiveName) {
        // console.log("即将要离开的标签页名字："+oldActiveName);
        // console.log("即将要去的标签页名字"+activeName);
        if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
          this.$message.error("请先选择商品分类");
          return false;
        }
      },
      // tabs标签被点击触发的函数
      async tabClicked() {
        // 证明访问的是动态参数面板
        if (this.activeIndex === "1") {
          const { data: res } = await this.$http.get(
            `categories/${this.cateId}/attributes`,
            {
              params: {
                sel: "many"
              }
            }
          );
          if (res.meta.status !== 200)
            return this.$message.error("获取动态参数列表失败");
          res.data.forEach(item => {
            item.attr_vals =
              item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
          });
          this.manyTableData = res.data;
          // console.log(res.data);
        }
        if (this.activeIndex === "2") {
          const { data: res } = await this.$http.get(
            `categories/${this.cateId}/attributes`,
            {
              params: {
                sel: "only"
              }
            }
          );
          if (res.meta.status !== 200)
            return this.$message.error("获取静态属性失败");
          this.onlyTableData = res.data;
        }
      },
      // 处理图片预览效果
      handlePreview(file) {
        console.log(file);
        this.previewPath = file.response.data.url;
        this.previewDialogVisible = !this.previewDialogVisible;
      },
      // 处理图片移除的操作
      handleRemove(file) {
        // 1.获取要删除的图片临时路径
        // 2.从pics数组中找到这个图片的索引值
        // 3.调用数组的splice方法，把图片信息对象从数组中移除。
        const filePath = file.response.data.tmp_path;
        const i = this.addForm.pics.findIndex(x => x.pics === filePath);
        this.addForm.pics.splice(i, 1);
        console.log(this.addForm);
      },
      //  图片上传成功的钩子函数
      handleSuccess(response) {
        // console.log(response);
        // 1.拼接得到图片信息对象  2.将图片信息对象push到pics数组中
        const picInfo = { pic: response.data.tmp_path };
        this.addForm.pics.push(picInfo);
        console.log(this.addForm);
      },
      // 添加商品
      addGoods() {
        console.log(this.addForm);
        this.$refs.addFormRef.validate(async vaild => {
          if (!vaild) return this.$message.error("请填写必要的表单项！");
          // 执行添加的业务逻辑
          //处理动态参数 还要处理静态属性
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(" ")
            };
            this.addForm.attrs.push(newInfo);
          });
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            };
            this.addForm.attrs.push(newInfo);
          });
          // 延伸一个新知识点 深拷贝 指的是把对象原封不动再copy出新的一份，与源对象互不相干。
          // lodash cloneDeep(obj)
          const form = _.cloneDeep(this.addForm);
          form.goods_cat = form.goods_cat.join(",");
          console.log(form);
          //发起添加商品请求  商品的名称必须是唯一的
          const { data: res } = await this.$http.post("goods", form);
          console.log(res);
          if (res.meta.status !== 201)
            return this.$message.error("添加商品操作失败");

          this.$message.success("添加商品成功(*^▽^*)");
          this.$router.push("/goods");
        });
      }
    },
    computed: {
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2];
        } else {
          return null;
        }
      }
    }
  };
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 5px 0 0 !important;
  }

  .previewImg {
    width: 100%;
  }

  .btnAdd {
    margin-top: 15px;
  }
</style>
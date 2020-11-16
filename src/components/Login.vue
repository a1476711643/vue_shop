<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form label-width="0px" class="login_form" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input  prefix-icon="el-icon-user" v-model="loginForm.username" ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input  prefix-icon="el-icon-lock" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
    data(){
        return {
            //这是登录表单的数据绑定对象
            loginForm:{
                username:'',
                password:''
            },
            //这是表单的验证规则对象
            loginFormRules:{
                //验证用户名是否合法
                username:[
                    {required:true,message:'请输入用户名',trigger:'blur'},
                    { min:3,max:6,message:'长度在3~6个字符',trigger:'blur'  }
                ],
                password:[
                    {require:true,message:'请输入密码',trigger:'blur'},
                    { min:5, max:12,message:'密码在5~12个字符',trigger:'blur'}
                ]
            }
        };
    },
    methods:{
      //点击重置按钮 重置登录表单
      resetLoginForm(){
        this.$refs.loginFormRef.resetFields();
      },
      //为了简化promise里的数据，我们用async 修饰方法， 用await 接受数值。
      login(){
        this.$refs.loginFormRef.validate(async (vaild) => {
          console.log(vaild);
          if(!vaild) return;
           const {data}= await this.$http.post('login',this.loginForm);   //解构赋值的运用。直接一手抓data
           console.log(data);

           if(data.meta.status !== 200){
             return this.$message.error('登录失败啦o(╥﹏╥)o');
           }else{
             this.$message.success('登录成功ヾ(@^▽^@)ノ');
           }
          //把token保存到sessionStorage中
          window.sessionStorage.setItem('token',data.data.token)
          //通过编程式导航跳转到后台主页 地址是/home
          this.$router.push('/home')
           
          
          
        });
      }
    }
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;

  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    height: 130px;
    width: 130px;

    border: 1px soild #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;

    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

    .btns{
        display: flex;
        justify-content: flex-end;
    }
    
    .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
    }

}
</style>
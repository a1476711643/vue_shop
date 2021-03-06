import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'  //注意路径是否正确
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home', component: Home, redirect: '/welcome', children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users, },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders' , component: Order},
      { path: '/reports' , component: Report }
    ]
  },

]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, form, next) => {
  //to 代表将要访问的路径
  //from 代表我们从哪个路径跳转来的
  //next 是一个函数，代表放行  next() 放行  next('字符串') 强制跳转
  if (to.path === '/login') return next();
  //先要获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')              //没登录，就滚回去登录
  next()    //登录了，就进去吧

})

export default router

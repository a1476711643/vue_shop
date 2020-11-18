import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'

import axios from'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'   //配置请求的根路径 在api文档找的。 是defaults 不是default
axios.interceptors.request.use(config => {
  
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config);
  //在最后必须return config 固定写法。
  return config;
  
})

Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

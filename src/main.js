import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'

import axios from'axios'

Vue.prototype.$http = axios

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'   //配置请求的根路径 在api文档找的。 是defaults 不是default
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

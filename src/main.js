import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'   //配置请求的根路径 在api文档找的。 是defaults 不是default
axios.interceptors.request.use(config => {
  
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config);
  //在最后必须return config 固定写法。
  return config;
  
})



Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table',TreeTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.filter('dateFormat',function(originVal){
 const dt =  new Date(originVal)
 const y = dt.getFullYear();
 const m = (dt.getMonth()+1+'').padStart(2,'0');  //月份是双位数的时候，让前面填充0
 const d = (dt.getDate()+'').padStart(2,'0');
 const hh = (dt.getHours()+'').padStart(2,'0');
 const mm = (dt.getMinutes()+'').padStart(2,'0');
 const ss = (dt.getSeconds()+'').padStart(2,'0');

 return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;

})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

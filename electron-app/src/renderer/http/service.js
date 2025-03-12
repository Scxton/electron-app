import  axios  from 'axios'
import { Promise } from 'core-js'
import { getToken } from '../utils/setToken'
import { ElMessage } from 'element-plus'

const service = axios.create({
    baseURL: 'http://127.0.0.1:8000/',
    timeout: 6000  //超时时间
})


//添加请求拦截器
service.interceptors.request.use((config) => {
    // 请求之前做什么(获取并设置token)
    // let token = getToken('token')
    // if (token != "" && token != null) {
    //  config.headers['token'] = getToken('token')
    // }
    return config
}, (error) => {
    return Promise.reject(error)
})

//添加响应拦截器
service.interceptors.response.use((response) => {
    //对响应数据做什么
    let { resultCode, resultMsg, type } = response.data
    if (resultCode != 200) {
        ElMessage({
            message: resultMsg,
            type: type,
        })
    }
    return response
}, (error) => {
    return Promise.reject(error)
})

export default service
import axios from 'axios'
import { Promise } from 'core-js'
import { getToken } from './token'
import { ElMessage } from 'element-plus'
import config from './config'
const NETWORK_ERROR = '网络请求错误，请稍后重试...'

const service = axios.create({
    baseURL: config.baseApi,
    timeout: 15000  //超时时间15
})

//添加请求拦截器
service.interceptors.request.use((config) => {
    console.log("config = ",config.baseApi)
    //请求之前做什么(获取并设置token)
    let token = getToken('token')
    if (token != "" && token != null) {
        console.log("22222222222222222222222")
        config.headers['Authorization'] = "Bearer " + getToken('token')
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

//添加响应拦截器
service.interceptors.response.use((response) => {
    console.log('111111====', config.baseApi)
    //对响应数据做什么
    console.log('111111====', response.data)
    let { type, resultCode, resultMsg, data } = response.data
    if (resultCode == 200) {
        if (resultMsg !== "") {
            ElMessage({
                message: resultMsg,
                type: type,
            })
        }
        return data
    } else {
        ElMessage({
            message: resultMsg || NETWORK_ERROR,
            type: type,
        })
        return Promise.reject(resultMsg || NETWORK_ERROR)
    }

}, (error) => {
    ElMessage({
        message: "后台服务器无响应",
        type: "error",
    })
    return Promise.reject(error)
})

function request(options) {
    options.method = options.method || 'get'
    if (options.method.toLowerCase() == 'get') {
        options.params = options.params
    }
    if (options.method.toLowerCase() == 'post') {
        //options.params = options.params
        options.data = options.data
    }
    if (options.method.toLowerCase() == 'put') {
        options.params = options.params
        options.data = options.data
    }
    //对mock的处理
    let isMock = config.mock
    if (typeof options.mock !== 'undefined') {
        isMock = options.mock
    }
    //对线上环境做处理
    if (config.env == 'prod') {
        //不给用到mock的机会
        service.defaults.baseURL = config.baseApi
    } else {
        service.defaults.baseURL = isMock ? config.mockApi : config.baseApi
    }
    return service(options)
}

export default request



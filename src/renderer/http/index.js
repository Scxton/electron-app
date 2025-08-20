
/**
 * 环境配置文件
 * 一般在企业级项目中，有三个环境
 * 开发环境
 * 测试环境
 * 线上环境
 */
//当前环境
//const env = import.meta.env.MOOD || 'prod'
const env = process.env.NODE_ENV || 'production'

const EnvConfig = {
    development: {
        baseApi: 'http://localhost:8007',
        mockApi: ''
    },
    test: {
        baseApi: 'http://localhost:8007',
        mockApi: ''
    },
    production: {
        baseApi: 'http://localhost:8007', 
        mockApi: ''
    }
}

export default {
    env,
    //mock的总开关
    mock: false,
    ...EnvConfig[env]
}

import request from "./request"

//测试接口1
export function test1() {
    return request({
        method: 'get',
        url: '/test/test1',
        params: {
            "userName": "userName",
            "password": "password"
        },
        mock: false
    })
}

//测试接口2
export function test2() {
    return request({
        method: 'get',
        url: '/test/test2',
        params: {
        },
        mock: false
    })
}
//测试接口3
export function test3() {
    return request({
        method: 'get',
        url: '/test/test3',
        params: {
        },
        mock: false
    })
}

//测试接口4
export function test4(testCase) {
    return request({
        method: 'post',
        url: '/testCase/test',
        data: testCase,
        mock: false
    })
}
//测试千兆网连通性接口
export function connect(testCase,ips) {
    return request({
        method: 'post',
        url: '/test/test',
        data: testCase, 
        data: ips,
        mock: false
    })
}

//测试接口5
export function test5(param1, param2, meta) {
    return request({
        method: 'put',
        url: '/test/test5',
        data: meta,
        params: {
            "userName": param1,
            "password": param2
        },
        mock: false
    })
}



export function getInfo(){
    return request({
        method: 'get',
        url: '//getPageAlarmInfos',
        data: meta,
        params: {
            // "userName": param1,
            // "password": param2
        },
        mock: false
    })
}
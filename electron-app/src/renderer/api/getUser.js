import request from "../http/request";

//获取用户信息
// let test = {
//     page: 0,
//     size: 10
// }
// service({
//     method: 'post',
//     url: "/user/users",
//     // params: {
//     //     "id": id,
//     //     "ids": ids.join(','),
//     //     "currentIds": currentIds.join(',')
//     // }
//     data: test
// }).then(res => {
//     console.log('123', res.data)
//     if (res && res.status === 200) {
//         if (res.data.resultCode === 200) {
//             // let userName = getToken("username")
//             // initUsers(root, userName)
//             // root.$message({
//             //     type: 'success',
//             //     message: res.data.resultMsg
//             // });

//         }
//     }

// }).catch(error => {
//     throw error
// })


//查询所有用户信息
export function queryAll() {
    return request({
        method: 'get',
        url: '/userRolePermissions/queryAll',
        params: {
            
        },
        mock: false
    })
}

//分页查询所有用户信息
export function queryAllWithPagination(pageNum, pageSize) {
    return request({
        method: 'get',
        url: '/userRolePermissions/queryAllWithPagination',
        params: {
            "pageNum": pageNum,
            "pageSize": pageSize
        },
        mock: false
    })
}
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

//添加用户
export function addUser(userData) {
    return request({
        method: 'post',
        url: '/userRolePermissions/add',
        data: userData,
        mock: false
    })
}

//编辑用户
export function editUser(userData) {
    return request({
        method: 'put',
        url: '/userRolePermissions/edit',
        data: userData,
        mock: false
    })
}

//删除用户
export function deleteUser(id) {
    return request({
        method: 'get',
        url: '/userRolePermissions/delete',
        params: {
            id: id
        },
        mock: false
    })
}
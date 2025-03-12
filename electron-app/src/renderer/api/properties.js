import request from "../http/request";

//查询所有产权信息
export function queryAll() {
    return request({
        method: 'get',
        url: '/intellectualProperty/queryAll',
        params: {
            
        },
        mock: false
    })
}

// //根据成果ID删除数据库中的成果条目
// export function deleteItem(id) {
//     return request({
//         method: 'get',
//         url: '/intellectualProperty/delete',
//         params: {
//             "id": id
//         },
//         mock: false
//     })
// }

//分页查询所有产权信息
export function queryAllWithPagination(pageNum, pageSize) {
    return request({
        method: 'get',
        url: '/intellectualProperty/queryAllWithPagination',
        params: {
            "pageNum": pageNum,
            "pageSize": pageSize
        },
        mock: false
    })
}


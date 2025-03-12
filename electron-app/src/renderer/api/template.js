import request from "../http/request";

//查询所有模板数据
export function queryAll() {
    return request({
        method: 'get',
        url: '/achievementCheckTemplate/queryAll',
        params: {
            
        },
        mock: false
    })
}

// //根据成果ID删除数据库中的成果条目
// export function deleteItem(id) {
//     return request({
//         method: 'get',
//         url: '/achievementCheckTemplate/delete',
//         params: {
//             "id": id
//         },
//         mock: false
//     })
// }

//分页查询所有模板数据
export function queryAllWithPagination(pageNum, pageSize) {
    return request({
        method: 'get',
        url: '/achievementCheckTemplate/queryAllWithPagination',
        params: {
            "pageNum": pageNum,
            "pageSize": pageSize
        },
        mock: false
    })
}


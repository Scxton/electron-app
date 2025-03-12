import request from "../http/request";

//查询所有待审批成果数据
export function queryAll() {
    return request({
        method: 'get',
        url: '/approvalRecords/queryAll',
        params: {
            
        },
        mock: false
    })
}

// //根据成果ID删除数据库中的成果条目
// export function deleteItem(id) {
//     return request({
//         method: 'get',
//         url: '/approvalRecords/delete',
//         params: {
//             "id": id
//         },
//         mock: false
//     })
// }

//分页查询所有待审批成果数据
export function queryAllWithPaginationForApproval(pageNum, pageSize) {
    return request({
        method: 'get',
        url: '/approvalRecords/queryAllWithPaginationForApproval',
        params: {
            "pageNum": pageNum,
            "pageSize": pageSize
        },
        mock: false
    })
}


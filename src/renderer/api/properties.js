import request from "../http/request";

//查询所有产权信息
export function queryAll() {
    console.log('API调用: queryAll() - 开始请求所有产权信息')
    const startTime = performance.now()
    
    return request({
        method: 'get',
        url: '/intellectualProperty/queryAll',
        params: {},
        mock: false
    }).then(response => {
        const endTime = performance.now()
        console.log(`API调用: queryAll() - 完成, 耗时: ${(endTime - startTime).toFixed(2)}ms, 返回记录数: ${response?.length || 0}`)
        return response
    }).catch(error => {
        console.error('API调用: queryAll() - 失败:', error)
        throw error
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
    console.log(`API调用: queryAllWithPagination(${pageNum}, ${pageSize}) - 开始请求分页产权信息`)
    const startTime = performance.now()
    
    return request({
        method: 'get',
        url: '/intellectualProperty/queryAllWithPagination',
        params: {
            "pageNum": pageNum,
            "pageSize": pageSize
        },
        mock: false
    }).then(response => {
        const endTime = performance.now()
        console.log(`API调用: queryAllWithPagination() - 完成, 耗时: ${(endTime - startTime).toFixed(2)}ms, 返回记录数: ${response?.length || 0}`)
        return response
    }).catch(error => {
        console.error(`API调用: queryAllWithPagination(${pageNum}, ${pageSize}) - 失败:`, error)
        throw error
    })
}

// 添加产权信息
export function addProperty(intellectualProperty) {
    console.log('API调用: addProperty() - 开始添加产权信息', intellectualProperty)
    const startTime = performance.now()
    
    return request({
        method: 'post',
        url: '/intellectualProperty/add',
        data: intellectualProperty,
        mock: false
    }).then(response => {
        const endTime = performance.now()
        console.log(`API调用: addProperty() - 完成, 耗时: ${(endTime - startTime).toFixed(2)}ms`)
        console.log('API调用: addProperty() - 返回结果:', response)
        return response
    }).catch(error => {
        console.error('API调用: addProperty() - 失败:', error)
        throw error
    })
}

// 编辑产权信息
export function editProperty(intellectualProperty) {
    console.log('API调用: editProperty() - 开始编辑产权信息', intellectualProperty)
    const startTime = performance.now()
    
    return request({
        method: 'post',
        url: '/intellectualProperty/edit',
        data: intellectualProperty,
        mock: false
    }).then(response => {
        const endTime = performance.now()
        console.log(`API调用: editProperty() - 完成, 耗时: ${(endTime - startTime).toFixed(2)}ms`)
        return response
    }).catch(error => {
        console.error('API调用: editProperty() - 失败:', error)
        throw error
    })
}

// 删除产权信息
export function deleteProperty(id) {
    console.log(`API调用: deleteProperty(${id}) - 开始删除产权信息`)
    const startTime = performance.now()
    
    return request({
        method: 'get',
        url: '/intellectualProperty/delete',
        params: {
            "id": id
        },
        mock: false
    }).then(response => {
        const endTime = performance.now()
        console.log(`API调用: deleteProperty() - 完成, 耗时: ${(endTime - startTime).toFixed(2)}ms`)
        return response
    }).catch(error => {
        console.error(`API调用: deleteProperty(${id}) - 失败:`, error)
        throw error
    })
}


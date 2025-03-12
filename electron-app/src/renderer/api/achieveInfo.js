import request from "../http/request";

export function queryAll() {

    return request({
        method: 'get',
        url: '/achievementTable/queryAll',
        params: {
            
        },
        mock: false
    })

}

//根据成果ID删除数据库中的成果条目
export function deleteItem(id) {
    return request({
        method: 'get',
        url: '/achievementTable/delete',
        params: {
            "id": id
        },
        mock: false
    })
}

//分页查询所有数据
export function queryAllWithPagination(pageNum, pageSize) {
    return request({
        method: 'get',
        url: '/achievementTable/queryAllWithPagination',
        params: {
            "pageNum": pageNum,
            "pageSize": pageSize
        },
        mock: false
    })
}

//分页查询专利数据
export function queryAllWithPatent(pageNum, pageSize) {
    return request({
        method: 'get',
        url: '/achievementTable/queryAllWithPatent',
        params: {
            "pageNum": pageNum,
            "pageSize": pageSize
        },
        mock: false
    })
}

//分页查询论文数据
export function queryAllWithPaper(pageNum, pageSize) {
    return request({
        method: 'get',
        url: '/achievementTable/queryAllWithPaper',
        params: {
            "pageNum": pageNum,
            "pageSize": pageSize
        },
        mock: false
    })
}

//分页查询其他成果数据
export function queryAllWithOthers(pageNum, pageSize) {
    return request({
        method: 'get',
        url: '/achievementTable/queryAllWithOthers',
        params: {
            "pageNum": pageNum,
            "pageSize": pageSize
        },
        mock: false
    })
}

//编辑（更新）数据库中的成果信息
export function update(useCase) {
    return request({
        method: 'post',
        url: '/achievementTable/edit',
        data: useCase,
        mock: false
    })
}
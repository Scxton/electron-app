import request from "../http/request";

export function queryById(id) {
    console.log('[API] Querying interaction by ID:', id);
    return request({
        method: 'get',
        url: '/interactionEvaluation/id',
        params: {
            "id": id
        },
        mock: false
    }).then(response => {
        console.log('[API] Query result:', response);
        return response;
    }).catch(error => {
        console.error('[API] Query failed:', error);
        throw error;
    });
}
//添加交互评价
export function addInteractionEvaluation(interactionEvaluation) {
    console.log('[API] Adding interaction evaluation:', interactionEvaluation);
    return request({
        method: 'post',
        url: '/interactionEvaluation/add',
        data: interactionEvaluation
    }).then(response => {
        console.log('[API] Add successful:', response);
        return response;
    }).catch(error => {
        console.error('[API] Add failed:', error);
        throw error;
    });
}
//修改交互评价
export function updateInteractionEvaluation(interactionEvaluation) {
    return request({
        method: 'post',
        url: '/interactionEvaluation/update',
        data: interactionEvaluation
    })
}
//删除交互评价
export function deleteInteractionEvaluation(id) {
    return request({
        method: 'post',
        url: '/interactionEvaluation/delete/id',
        data: {
            "id": id
        }
    })  
}
//查询交互评价列表
export function queryInteractionEvaluationList(interactionEvaluation, pageNum = 1, pageSize = 10) {
    console.log('[API] Querying evaluations with pagination:', {
        interactionEvaluation,
        pageNum,
        pageSize
    });
    
    return request({
        method: 'post',
        url: '/interactionEvaluation/querylimitWithPagination',
        data: interactionEvaluation,
        params: {
            pageNum,
            pageSize
        }
    }).then(response => {
        console.log('[API] Query result:', response);
        return response;
    }).catch(error => {
        console.error('[API] Query failed:', error);
        throw error;
    });
}

//根据成果ID查询评价列表
export function queryEvaluationsByAchievementId(achievementId) {
    return request({
        method: 'get',
        url: '/interactionEvaluation/id',
        params: {
            "achievementId": achievementId
        }
    })
}

//获取成果的平均评分
export function getAverageRating(achievementId) {
    return request({
        method: 'get',
        url: '/interactionEvaluation/averageRating',
        params: {
            "achievementId": achievementId
        }
    })
}

//检查用户是否已评价
export function checkUserEvaluation(userId, achievementId) {
    console.log('[API] Checking user evaluation:', { userId, achievementId });
    return request({
        method: 'get',
        url: '/interactionEvaluation/checkUserEvaluation',
        params: {
            "userId": userId,
            "achievementId": achievementId
        }
    }).then(response => {
        console.log('[API] Check result:', response);
        return response;
    }).catch(error => {
        console.error('[API] Check failed:', error);
        throw error;
    });
}

import request from "../http/request";

export function loginTest(userName, password) {
    console.log('Login attempt:', userName); // Debug: Log username attempting to login
    
    let userInfo = {
        "username": userName,
        "password": password
    }
    
    console.log('Sending authentication request...'); // Debug: Log request being sent
    
    return request({
        method: 'post',
        url: '/auth/authenticate',
        data: userInfo,
        mock: false
    }).then(response => {
        console.log('Authentication response received:', response); // Debug: Log successful response
        return response;
    }).catch(error => {
        console.error('Authentication error:', error); // Debug: Log any errors
        throw error;
    });
}

export function queryUserByName(userName, pageNum = 1, pageSize = 10) {
    console.log('[API]Querying user by name:', userName); // Debug: Log username being queried
    return request({
        method: 'get',
        url: 'userRolePermissions/queryByLike',
        params: {
            userName,
            pageNum,
            pageSize
        },
        mock: false
    }).then(response => {
        console.log('Query response received:', response);
        return response;
    }).catch(error => {
        console.error('Query error:', error);
        throw error;
    });
}

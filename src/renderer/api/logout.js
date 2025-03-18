import request from "../http/request";

export function logoutTest(userId, userName) {
    return request({
        method: 'post',
        url: '/auth/logout',
        params: {
            userId,
            userName
        }
    })
}

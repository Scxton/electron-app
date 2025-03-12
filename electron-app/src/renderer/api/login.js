
import request from "../http/request";

export function loginTest(userName,password) {
    let userInfo = {
        "username": userName,
        "password": password
    }
    return request({
        method: 'post',
        url: '/auth/authenticate',
        data: userInfo,
        mock: false
    })

}

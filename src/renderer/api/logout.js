
import request from "../http/request";

export function logoutTest() {
   
    return request({
        method: 'post',
        url: '/auth/logout',
       
      
    })

}

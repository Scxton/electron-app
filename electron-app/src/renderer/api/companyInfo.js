import request from "../http/request";

export function getCompanyInfo() {

    return request({
        method: 'get',
        url: '/system/company/getAllComInfo',
        params: {
            
        },
        mock: false
    })

}
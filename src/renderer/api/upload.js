import request from '../http/request'


export function addAchievement(achievementData) {
    return request({
        method: 'post',
        url: 'achievementTable/add',
        data: achievementData,
        mock: false
    })
}

// export function addFile(fileData) {
//     return request({
//         method: 'post',
//         url: '/uploadbatch',
//         // url: '/achievement/uploadtoAudit',
//         data: fileData,
//         mock: false
//     })
// }





export function addFile(files, achievementData) {
    const formData = new FormData()
    
    // 添加文件
    files.forEach(file => {
      formData.append('file', file)
    })
    
    // 添加表单数据（转换为JSON字符串）
    const achievementBlob = new Blob(
      [JSON.stringify(achievementData)], 
      { type: 'application/json' }
    )
    formData.append('achievementTable', achievementBlob)

    return request({
      url: '/achievement/uploadtoAudit',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
}

  
// export function Upload_template(formData) {
//     return request({
//         url: '/template/upload',
//         method: 'post',
//         data: formData,
//         headers: {
//             'Content-Type': 'multipart/form-data'
//         }
//     })
// }
// export function Upload_template(formData) {
//     return request({
//       url: '/template/upload',
//       method: 'post',
//       data: formData,
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     })
//   }

export function Upload_template(formData) {
    return request({
        url: '/template/upload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function getAllOrganizations() {
    return request({
        method: 'get',
        url: 'organizationInfo/queryAll',
        mock: false
    })
}


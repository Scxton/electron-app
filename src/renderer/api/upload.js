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
  
  console.log('[API]开始提交投诉请求:', { files, achievementData })
  
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
    console.log('formData', formData)

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

export function upgradeToAudit(files, achievementId, newVersion) {
  console.log('[API]开始提交更新:', { files, achievementId, newVersion })
  const formData = new FormData()
  
  // 添加文件
  files.forEach(file => {
    formData.append('file', file)
  })
  const achievementIdBlob = new Blob(
    [JSON.stringify(achievementId)],
    { type: 'application/json' }
  )
  const newVersionBlob = new Blob(
    [JSON.stringify(newVersion)],
    { type: 'application/json' }
  )

  // 添加成果ID和新版本号
  formData.append('achievementId', achievementIdBlob)
  // formData.append('newVersion', newVersionBlob)
  formData.append('newVersion', newVersion)
  console.log('formData', formData)

  return request({
    url: '/achievement/upgradetoAudit',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}


import axios from 'axios'

// 文件上传到审核接口
export const uploadToAudit = async (files, achievementName, userId) => {
  const formData = new FormData()
  
  // 添加多个文件（注意参数名需与后端@RequestParam("file")一致）
  files.forEach(file => {
    formData.append('file', file.raw) // 注意：这里假设使用element-plus上传组件，原生input需直接append file对象
  })
  
  // 添加其他参数
  formData.append('achievementName', achievementName)
  formData.append('userId', userId)

  try {
    const response = await axios.post('/achievement/uploadtoAudit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    console.error('文件上传失败:', error)
    return {
      type: 'fail',
      message: error.response?.data?.message || '文件上传请求失败'
    }
  }
}

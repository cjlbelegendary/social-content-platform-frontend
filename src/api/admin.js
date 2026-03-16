import service from './index'

// 验证管理员身份
export const validateAdmin = (raiseError = true) => {
  return service.get('/admin/validate', {
    params: {
      raise_error: raiseError ? undefined : false
    }
  })
}
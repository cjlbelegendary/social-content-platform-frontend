import service from './index'

export const generateImage = (data) => {
  return service.post('/image/generate', data, {
    timeout: 120000
  })
}

export const regenerateImage = (data) => {
  return service.post('/image/regenerate', data, {
    timeout: 120000
  })
}

export const generateImageFromContent = (data) => {
  return service.post('/image/generate-from-content', data, {
    timeout: 120000
  })
}

export const getImageHistory = (params = {}) => {
  return service.get('/image/history', { params })
}

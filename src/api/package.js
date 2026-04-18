import service from './index'

export const createPackage = (data) => {
  return service.post('/package/create', data)
}

export const getPackageDetail = (packageId) => {
  return service.get(`/package/${packageId}`)
}

export const getPackageList = (params = {}) => {
  return service.get('/package/list', { params })
}

export const updatePackage = (packageId, data) => {
  return service.put(`/package/${packageId}`, data)
}

export const deletePackage = (packageId) => {
  return service.delete(`/package/${packageId}`)
}

export const copyPackage = (packageId) => {
  return service.post(`/package/${packageId}/copy`)
}

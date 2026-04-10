import service from './index'

export const getHotspotList = (params = {}) => {
  return service.get('/hotspot/list', { params })
}

export const getHotspotDetail = (hotspotId) => {
  return service.get(`/hotspot/detail/${hotspotId}`)
}

export const refreshHotspots = () => {
  return service.post('/hotspot/refresh')
}

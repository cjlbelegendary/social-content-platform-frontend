import service from './index'

export const createSchedule = (data) => {
  return service.post('/schedule/create', data)
}

export const getScheduleList = (params = {}) => {
  return service.get('/schedule/list', { params })
}

export const updateSchedule = (scheduleId, data) => {
  return service.put(`/schedule/${scheduleId}`, data)
}

export const deleteSchedule = (scheduleId) => {
  return service.delete(`/schedule/${scheduleId}`)
}

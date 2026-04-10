import service from './index'

export const getPersonaInfo = () => {
  return service.get('/persona/info')
}

export const savePersona = (data) => {
  return service.post('/persona/save', data)
}

import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  if (!event.context.auth) {
    return { statusCode: 401, message: 'Unauthorized' }
  }
  return event.context.auth
})
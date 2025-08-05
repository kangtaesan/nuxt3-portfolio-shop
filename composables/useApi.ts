import { $fetch } from 'ofetch'

/* 에러 처리 */
interface ErrorResponse {
  statusCode?: number
  message?: string
}
function throwIfErrorResponse(response: ErrorResponse) {
  if (response.statusCode && response.statusCode >= 400) {
    throw new Error(`[${response.statusCode}] ${response.message || '요청 실패'}`)
  } // undefined, null, 0 이 아니거나 400이 넘겨야 에러 메세지 던짐
}

/* REST API */
export const useApi = () => {

  const get = async <T = any>(url: string, params?: object) => {
    const response =  await $fetch<T>(url, { method: 'GET', params})
    throwIfErrorResponse(response as ErrorResponse)
    return response as T
  }

  const post = async <T = any>(url: string, body?: object) => {
    const response = await $fetch<T>(url, { method: 'POST', body })
    throwIfErrorResponse(response as ErrorResponse)
    return response as T
  }

  const put = async <T = any>(url: string, body?: object) => {
    const response = await $fetch<T>(url, { method: 'PUT', body })
    throwIfErrorResponse(response as ErrorResponse)
    return response as T
  }

  const patch = async <T = any>(url: string, body?: object) => {
    const response = await $fetch<T>(url, { method: 'PATCH', body })
    throwIfErrorResponse(response as ErrorResponse)
    return response as T
  }

  const del = async <T = any>(url: string) => {
    const response = await $fetch<T>(url, { method: 'DELETE' })
    throwIfErrorResponse(response as ErrorResponse)
    return response as T
  }

  return { get, post, put, patch, del }
}
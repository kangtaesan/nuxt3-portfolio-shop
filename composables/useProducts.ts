import type { Product } from '~/types/product' 

// useFetch는 SSR/CSR 대응 데이터 패칭을 위해 쓰고 { data, pending, error } 구조 제공
export const fetchProductList = async () => {
    const { data } = await useFetch<{ statusCode: number; data: Product[] }>('/api/products')
    return computed(() => {
        return data.value?.data ?? []
        // data는 { statusCode, data: [...] }로 이루어져있어 
        // Product[]로 직접 쓸 수 없으므로 data.value.data 까지 작성
      })
}

export const fetchProductById = async (id:string) => {
    const { data, error } = await useFetch<Product>(`/api/products/${id}`)
    return { data, error }
}

export const uploadProductImage= async(file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return await $fetch<{ url: string }>('/api/products/upload/blob-image', {
      method: 'POST',
      body: fd,
    })
  }
export interface OptionStock {
    _id?: string
    label: string
    qty: number
}

export interface Product {
    _id: string
    name: string
    price: number
    image: string
    description: string
    stock: number
    category?: string
    isSoldOut: boolean
    detailImages: string[]
    optionStocks?: OptionStock[]
  }
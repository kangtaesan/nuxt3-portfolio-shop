// /types/cs.ts
export type CsStatus = 'pending' | 'answered'

export type CsReply = {
  _id: string
  adminId: string
  adminName: string
  message: string
  createdAt: string
}

export type CsDoc = {
  _id: string
  userId: string
  nickname: string
  title: string
  content: string
  orderId: string | null
  category: string | null
  status: CsStatus
  replies: CsReply[]
  createdAt: string
  updatedAt: string
}

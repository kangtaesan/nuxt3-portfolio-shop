import { defineEventHandler, createError, readBody } from 'h3';
import connectDB from '@/server/plugins/mongoose.server';
import Cart from '@/server/models/CartModel';

type CartItemInput = {
  productId: string;
  name: string;
  price: number | string;
  imageUrl?: string;
  optionName?: string;
  optionExtraPrice?: number | string;
  quantity: number | string;
};

export default defineEventHandler(async (event) => {
  await connectDB();

  const userId = event.context.auth?.user?.id;
  if (!userId) {
    throw createError({ statusCode: 401, message: '로그인이 필요합니다.' });
  }

  // GET /api/cart  → 유저 카트 조회
  if (event.method === 'GET') {
    const doc = await Cart.findOne({ userId }).lean<{ items: CartItemInput[] }>();
    return { items: doc?.items ?? [] };
  }

  // PUT /api/cart  → 유저 카트 전체 저장(업서트)
  if (event.method === 'PUT') {
    const body = await readBody<{ items: CartItemInput[] }>(event);
    const incoming = Array.isArray(body?.items) ? body.items : [];

    // 정규화 + 중복 라인 합치기(productId + optionName 기준)
    const merged = incoming
      .filter((it) => it && it.productId) 
      .map((it) => ({
        productId: String(it.productId),
        name: String(it.name ?? ''),
        price: Number(it.price ?? 0),
        imageUrl: it.imageUrl ?? undefined,
        optionName: it.optionName ?? undefined,
        optionExtraPrice: Number(it.optionExtraPrice ?? 0),
        quantity: Math.max(1, Number(it.quantity ?? 1)),
      }))
      .reduce((acc, it) => {
        const key = `${it.productId}::${it.optionName ?? ''}`;
        const prev = acc.map.get(key);
        if (prev) prev.quantity += it.quantity;
        else { acc.map.set(key, it); acc.list.push(it); }
        return acc;
      }, { map: new Map<string, any>(), list: [] as any[] }).list;

    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: merged, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    return { ok: true, items: merged };
  }

  throw createError({statusCode: 401, message: '로그인이 필요합니다.',})
});
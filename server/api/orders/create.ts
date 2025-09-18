import { defineEventHandler, readBody, createError } from 'h3';
import connectDB from '@/server/plugins/mongoose.server';
import Product from '@/server/models/ProductModel';
import Order from '@/server/models/OrderModel';

type BodyItem = {
  productId: string;
  quantity: number;
  optionName?: string;
  optionExtraPrice?: number;
}

type OrderPayload = {
  items: BodyItem[]
  ordererName: string
  ordererPhone: string
  shippingAddr: string
  note?: string
}

interface ProductLean {
  _id: string;
  name: string;
  price: number;
  image?: string;     // 신규 필드
  imageUrl?: string;  // 과거 필드 케이스
  imageurl?: string;  // 과거 필드 케이스
  stock?: number;
}

type HydratedItem = BodyItem & {
  name: string;
  price: number;
  imageUrl?: string;
  lineTotal: number;
}

export default defineEventHandler(async (event) => {
  await connectDB();

  // 1) 인증 (미들웨어가 채운 context 사용)
  const userId: string | undefined = event.context.auth?.user?.id;
  if (!userId) {
    throw createError({ statusCode: 401, message: '로그인이 필요합니다.' });
  }

  // 2) 바디 검증
  const body = await readBody<OrderPayload>(event)
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '주문 항목이 비어 있습니다.' })
  }
  if (!body.ordererName?.trim() || !body.ordererPhone?.trim() || !body.shippingAddr?.trim()) {
    throw createError({ statusCode: 400, statusMessage: '주문자 정보가 누락되었습니다.' })
  }

  // 3) 가격/재고 검증 + 합계 계산
  const hydratedItems: HydratedItem[] = [];
  let productsTotal = 0;

  for (const item of body.items) {
    if (!item.productId || !Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw createError({ statusCode: 400, message: '잘못된 주문 항목입니다.' });
    }

    const product = await Product.findById(item.productId).lean<ProductLean>();
    if (!product) {
      throw createError({ statusCode: 404, message: '존재하지 않는 상품이 포함되어 있습니다.' });
    }
    // 옵션 재고가 있으면 옵션별로 체크
    const hasOptions = Array.isArray((product as any).optionStocks) && (product as any).optionStocks.length > 0
    if (hasOptions) {
      const optLabel = item.optionName ?? ''
      const opt = (product as any).optionStocks.find(
        (o: any) => String(o.label) === String(optLabel)
      )
    // 해당 옵션을 찾았고 수량 필드가 있으면 검사
    if (opt && typeof opt.qty === 'number' && opt.qty < item.quantity) {
      throw createError({
        statusCode: 400,
        statusMessage: `옵션 재고 부족: ${product.name} (${opt.label})`,
      })
    }
  } else {
    // 옵션 재고가 없으면 단일 stock으로 체크
    if (typeof (product as any).stock === 'number' && (product as any).stock < item.quantity) {
      throw createError({
        statusCode: 400,
        statusMessage: `재고 부족: ${product.name}`,
      })
    }
  }

    const optionExtra = Number(item.optionExtraPrice || 0);
    const unitPrice = Number(product.price) + optionExtra;
    const lineTotal = unitPrice * item.quantity;

    // ✅ 이미지 필드 폴백 처리 (image > imageUrl > imageurl)
    const img = product.image ?? product.imageUrl ?? product.imageurl ?? undefined;

    hydratedItems.push({
      productId: String(product._id),
      name: product.name,
      price: Number(product.price),
      imageUrl: img,
      optionName: item.optionName,
      optionExtraPrice: optionExtra,
      quantity: item.quantity,
      lineTotal,
    });

    productsTotal += lineTotal;
  }

  const shippingFee = 0;
  const orderTotal = productsTotal + shippingFee;

  const order = await Order.create({
    userId,
    items: hydratedItems,
    productsTotal,
    shippingFee,
    orderTotal,
    status: 'pending',
    ordererName: body.ordererName.trim(),
    ordererPhone: body.ordererPhone.trim(),
    shippingAddr: body.shippingAddr.trim(),
    note: body.note?.trim() ?? '',
  });

  return { orderId: String(order._id), orderTotal };
});
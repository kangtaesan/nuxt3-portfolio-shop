<template>
    <div class="wrap">
        <h2>상품 등록</h2>

        <form @submit.prevent="handleCreate">
            <div><label>상품명</label><input v-model="name" required /></div>
            <div><label>카테고리</label><input v-model="category" /></div>
            <div><label>가격</label><input type="number" v-model.number="price" required /></div>
            <div class="image">
                <label>대표 이미지</label>
                <input type="file" accept="image/*" ref="fileInput" @change="onFileChange" class="hidden">
                <div class="upload-box" @click="fileInput?.click()">
                    <img v-if="previewUrl" :src="previewUrl" alt="미리보기" class="preview">
                    <span v-else><i class="fa-solid fa-plus"></i></span>
                    <button v-if="previewUrl" type="button" class="delete-btn" @click.stop.prevent="removeMainImage">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                </div>
                </input>
            </div>
            <div class="detailImage">
                <label>상세 이미지</label>
                <div class="detail-upload">
                    <div v-for="(url, index) in detailPreviewUrls" :key="index" class="detail-upload-box"
                        @click="detailFileInputs[index]?.click()">
                        <img v-if="url" :src="url" alt="상세 이미지 미리보기" class="detail-preview" />
                        <span v-else><i class="fa-solid fa-plus"></i></span>
                        <button v-if="url" type="button" class="delete-btn"
                            @click.stop.prevent="removeDetailImage(index)">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <input type="file" accept="image/*" class="hidden"
                            :ref="el => (detailFileInputs[index] = el as HTMLInputElement | null)"
                            @change="e => onDetailFileChange(e, index)" />
                    </div>
                </div>
            </div>
            <div><label>설명</label><textarea v-model="description" rows="3" /></div>
            <div class="stock">
                <label>재고</label>
                <input type="number" v-model.number="stock" min="0" :disabled="useOptions || isSoldOut" />
                <label><input type="checkbox" v-model="useOptions">옵션</input></label>
                <div><label><input type="checkbox" v-model="isSoldOut" />품절</label></div>
            </div>
            <div v-if="useOptions" class="options">
                <div v-for="(opt, i) in optionStocks" :key="i" class="option-row">
                    <input placeholder="옵션명" v-model="opt.label" :disabled="isSoldOut" />
                    <input type="number" min="0" v-model.number="opt.qty" :disabled="isSoldOut" />
                    <button type="button" @click="removeOption(i)" :disabled="isSoldOut">삭제</button>
                </div>
                <button type="button" @click="addOption" :disabled="isSoldOut">+ 옵션 추가</button>
            </div>
            <div class="btn">
                <button type="submit">등록</button>
                <NuxtLink to="/admin/products">취소</NuxtLink>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { useApi } from '@/composables/useApi'
import { useRoute, useRouter } from 'vue-router'
import { uploadProductImage } from '@/composables/useProducts'
import type { OptionStock, Product } from '~/types/product'

const router = useRouter()
const route = useRoute()
const { post } = useApi()

const name = ref('')
const price = ref<number | null>(null)
const image = ref<File | null>(null)
const description = ref('')
const stock = ref(0)
const useOptions = ref(false)
const optionStocks = ref<OptionStock[]>([{ label: '', qty: 0 }])
const category = ref('')
const isSoldOut = ref(false)

const originalImageUrl = ref<string>('')
const previewUrl = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const detailPreviewUrls = ref<string[]>([''])
const detailImages = ref<(File | null)[]>([null])
const detailFileInputs = ref<(HTMLInputElement | null)[]>([])

function addOption() {
    optionStocks.value.push({ label: '', qty: 0 })
}
function removeOption(i: number) {
    optionStocks.value.splice(i, 1)
    if (!optionStocks.value.length) optionStocks.value.push({ label: '', qty: 0 })
}

// 사용자가 선택한 파일 객체(File)를 잡아다가 image ref에 넣음
const onFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0] || null
    if (!file) return
    image.value = file
    previewUrl.value = file ? URL.createObjectURL(file) : null
}

const onDetailFileChange = (e: Event, index: number) => {
    const file = (e.target as HTMLInputElement).files?.[0] || null
    if (!file) return
    detailImages.value[index] = file
    detailPreviewUrls.value[index] = file ? URL.createObjectURL(file) : ''

    // 마지막 칸에서 파일을 선택했을 때, 새 칸 추가
    if (index === detailPreviewUrls.value.length - 1 && file) {
        detailImages.value.push(null)
        detailPreviewUrls.value.push('')
        detailFileInputs.value.push(null)
    }
}

const removeMainImage = () => {
    image.value = null
    previewUrl.value = null
    originalImageUrl.value = ''
}

const removeDetailImage = (index: number) => {
    detailImages.value.splice(index, 1)
    detailPreviewUrls.value.splice(index, 1)
    detailFileInputs.value.splice(index, 1)

    // 최소 한 칸은 항상 남겨두기
    if (detailPreviewUrls.value.length === 0) {
        detailImages.value.push(null)
        detailPreviewUrls.value.push('')
        detailFileInputs.value.push(null)
    }
}


const id = route.query.id as string | undefined  // 쿼리에서 id 추출
// 마운트 시 기존 데이터 불러오기
onMounted(async () => {
    if (id) {
        const data = await $fetch<Product>(`/api/products/${id}`)
        name.value = data.name
        price.value = data.price
        description.value = data.description ?? ''
        stock.value = data.stock ?? 0
        category.value = data.category ?? ''
        isSoldOut.value = !!data.isSoldOut
        previewUrl.value = data.image || null
        originalImageUrl.value = data.image || ''

        const existing = data.detailImages ?? []
        detailPreviewUrls.value = [...existing, '']
        detailImages.value = new Array(detailPreviewUrls.value.length).fill(null)
        detailFileInputs.value = new Array(detailPreviewUrls.value.length).fill(null)

        // 옵션 재고: 값이 있으면 옵션 사용 ON, 없으면 OFF
        if (Array.isArray((data as any).optionStocks) && (data as any).optionStocks.length) {
            useOptions.value = true
            optionStocks.value = (data as any).optionStocks.map((opt: any) => ({
                label: String(opt.label ?? ''),
                qty: Number(opt.qty ?? 0),
            }))
        } else {
            useOptions.value = false
            optionStocks.value = [{ label: '', qty: 0 }]
        }
    }
})

const handleCreate = async () => {
    if (!name.value || price.value == null) {
        alert('상품명/가격을 입력해주세요.')
        return
    }

    try {
        let imageUrl = originalImageUrl.value
        if (image.value) {
            const { url } = await uploadProductImage(image.value)
            imageUrl = url
        }

        const detailUrls = (
            await Promise.all(
                detailPreviewUrls.value.map(async (url, i) => {
                    const file = detailImages.value[i]
                    if (file) {
                        const { url: uploaded } = await uploadProductImage(file)
                        return uploaded
                    }
                    // 마지막 빈 칸('')은 제외
                    return url || null
                })
            )
        ).filter((u): u is string => !!u)


        if (id) {
            // 수정
            await $fetch(`/api/products/${id}`, {
                method: 'PUT',
                body: {
                    name: name.value,
                    price: price.value,
                    image: imageUrl,
                    description: description.value,
                    category: category.value,
                    isSoldOut: isSoldOut.value,
                    detailImages: detailUrls,
                    stock: useOptions.value ? 0 : Number(stock.value || 0),
                    optionStocks: useOptions.value
                        ? optionStocks.value
                            .filter(opt => opt.label.trim() !== '')
                            .map(opt => ({ label: opt.label, qty: Number(opt.qty || 0) }))
                        : [],
                },
            })
            alert('수정 완료!')
        } else {
            await post('/api/products/create', {
                name: name.value,
                price: Number(price.value),
                image: imageUrl,
                description: description.value,
                category: category.value,
                isSoldOut: isSoldOut.value,
                detailImages: detailUrls,
                stock: useOptions.value ? 0 : Number(stock.value || 0),
                optionStocks: useOptions.value
                    ? optionStocks.value
                        .filter(opt => opt.label.trim() !== '')
                        .map(opt => ({ label: opt.label, qty: Number(opt.qty || 0) }))
                    : [],
            })
            alert('등록 완료!')
        }

        router.push('/admin/products') // 공개 목록으로 이동 → 즉시 노출
    } catch (e: any) {
        alert(e?.message || '등록 실패')
    }
}
</script>

<style scoped>
.wrap {
    max-width: none;
    width: 100%;
    margin: 0;
    padding: 0;
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    color: #1f2937;
}

.wrap h2 {
    font-size: 22px;
    font-weight: 700;
    margin: 10px 0 16px;
}

.wrap form>div {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.wrap form>div>label {
    display: flex;
    align-items: center;
}

.wrap label {
    min-width: 92px;
    font-size: 13px;
    color: #6b7280;
}

.wrap input,
.wrap textarea {
    flex: 1 1 auto;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
    font-size: 14px;
    outline: none;
    transition: box-shadow .15s ease, border-color .15s ease;
}

.wrap input:focus,
.wrap textarea:focus {
    border-color: #c7d2fe;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, .15);
}

.wrap input:disabled,
.wrap textarea:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #e5e7eb;
    cursor: not-allowed;
    box-shadow: none;
    opacity: .9;
}

.wrap input:disabled::placeholder,
.wrap textarea:disabled::placeholder {
    color: #b6bcc6;
}

.wrap button {
    background: #111827;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 10px 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 6px 16px rgba(0, 0, 0, .08);
    transition: opacity .15s ease, transform .05s ease;
}

.wrap button:hover {
    opacity: .95;
}

.wrap button:active {
    transform: translateY(1px);
}

.wrap button:disabled {
    background: #e5e7eb;
    color: #9aa3af;
    border: 1px solid #e5e7eb;
    cursor: not-allowed;
    box-shadow: none;
    opacity: .9;
    transform: none;
}

.wrap a {
    color: #374151;
    text-decoration: none;
    padding: 9px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    margin-left: 6px;
    transition: background .2s ease, border-color .2s ease;
}

.wrap a:hover {
    background: #f9fafb;
    border-color: #d1d5db;
}

.image {
    align-items: center;
    gap: 12px;
}

.upload-box {
    position: relative;
    width: 160px;
    height: 160px;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: border-color .15s ease, background .2s ease;
}

.upload-box:hover {
    border-color: #9ca3af;
    background: #fff;
}

.preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: filter .2s ease, opacity .2s ease;
}

.upload-box:hover .preview {
    filter: blur(2px);
    opacity: .6;
}

.delete-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, .92);
    color: #000;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 18px;
    font-weight: 700;
    display: none;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 14px rgba(0, 0, 0, .08);
}

.upload-box:hover .delete-btn {
    display: flex;
}

.hidden {
    display: none;
}

.detailImage {
    align-items: center;
}

.detail-upload {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.detail-upload-box {
    position: relative;
    width: 120px;
    height: 120px;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: border-color .15s ease, background .2s ease;
}

.detail-upload-box:hover {
    border-color: #9ca3af;
    background: #fff;
}

.detail-preview {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: filter .2s ease, opacity .2s ease;
}

.detail-upload-box:hover .detail-preview {
    filter: blur(2px);
    opacity: .6;
}

.detail-upload-box:hover .delete-btn {
    display: flex;
}

.image i,
.detail-upload-box i {
    font-size: 22px;
    color: #9ca3af;
}

label>input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
}

label:has(> input) {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fff;
    color: #111827;
    cursor: pointer;
    user-select: none;
    line-height: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .04);
}

label:has(> input:checked) {
    background: #111827;
    color: #fff;
    border-color: #111827;
}

.stock {
    align-items: center;
}

.stock input {
    max-width: 180px;
}

.stock label:has(> input) {
    margin-left: 10px;
}

.options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0;
    border: 0;
    background: transparent;
    align-items: flex-start;
    margin-left: 104px;
}

.option-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
}

.option-row input {
    width: 220px;
}

.option-row input+input {
    width: 120px;
}

.option-row button {
    background: #fff;
    color: #111827;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background .15s ease, border-color .15s ease, opacity .15s ease;
    box-shadow: none;
}

.option-row button:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
}

.options>button {
    align-self: flex-start;
    background: #fff;
    color: #111827;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 9px 14px;
    cursor: pointer;
    transition: background .15s ease, border-color .15s ease;
    box-shadow: none;
}

.options>button:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
}

.btn {
    font-size: 13px;
    font-weight: 400;
    gap: 6px !important;
    margin-top: 50px;
}

.btn>button {
    font-weight: 400 !important;
}
</style>
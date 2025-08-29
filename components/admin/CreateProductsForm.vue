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
                <input type="number" v-model.number="stock" min="0" :disabled="useOptions" />
                <label><input type="checkbox" v-model="useOptions"></input></label>
            </div>
            <div v-if="useOptions" class="options">
                <div v-for="(opt, i) in optionStocks" :key="i" class="option-row">
                    <input placeholder="옵션명" v-model="opt.label" />
                    <input type="number" min="0" v-model.number="opt.qty" />
                    <button type="button" @click="removeOption(i)">삭제</button>
                </div>
                <button type="button" @click="addOption">+ 옵션 추가</button>
            </div>
            <div><label><input type="checkbox" v-model="isSoldOut" /> 품절</label></div>
            <button type="submit">등록</button>
            <NuxtLink to="/admin/products">취소</NuxtLink>
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
.image {
    display: flex;
}

.upload-box {
    position: relative;
    width: 100px;
    height: 100px;
    border: 2px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;

}

.upload-box:hover .preview {
    filter: blur(2px);
    opacity: 0.6;
    background: white;
}


.upload-box:hover .delete-btn {
    display: flex;
}

.preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hidden {
    display: none;
}

.detail-upload {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.detail-upload-box {
    position: relative;
    width: 100px;
    height: 100px;
    border: 2px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
}

.detail-preview {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: filter 0.2s ease, opacity 0.2s ease;
}

/* hover 시 흰색 뿌연 효과 */
.detail-upload-box:hover .detail-preview {
    filter: blur(2px);
    opacity: 0.6;
    background: white;
}

/* 삭제 버튼 - 중앙 정렬 */
.delete-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.9);
    color: #000;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    cursor: pointer;
    font-size: 20px;
    font-weight: bold;
    display: none;
    justify-content: center;
    align-items: center;
}

/* hover 시 버튼 보이기 */
.detail-upload-box:hover .delete-btn {
    display: flex;
}
</style>
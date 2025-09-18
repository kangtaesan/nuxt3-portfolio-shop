<template>
    <section class="card">
        <!-- 1) 비밀번호 확인 단계 -->
        <div v-if="!unlocked" class="gate">
            <h2 class="h2">개인정보 확인</h2>
            <p class="desc">본인 확인을 위해 비밀번호를 입력하세요.</p>

            <!-- form: submit 사용 + 숨김 username -->
            <form class="row" @submit.prevent="onVerify" autocomplete="on">
                <!-- 비번 매니저/접근성용 힌트 -->
                <input type="text" :value="userId" name="username" autocomplete="username" tabindex="-1"
                    aria-hidden="true" class="sr-only" />
                <input v-model.trim="checkPw" type="password" class="inp" placeholder="현재 비밀번호" name="current-password"
                    autocomplete="current-password" />
                <button class="btn primary" :disabled="busy || !checkPw" type="submit">
                    확인
                </button>
            </form>

            <p v-if="err" class="err">{{ err }}</p>
        </div>

        <!-- 2) 개인정보 폼 -->
        <div v-else class="form">
            <h2 class="h2">회원정보</h2>

            <form class="grid">
                <label class="lbl">아이디</label>
                <input class="inp" :value="userId" readonly name="username" autocomplete="username" />

                <label class="lbl">이메일</label>
                <input class="inp" v-model.trim="form.email" type="email" placeholder="example@mail.com"
                    autocomplete="email" readonly />

                <label class="lbl">휴대폰</label>
                <input class="inp" v-model.trim="form.phone" type="tel" placeholder="010-1234-5678" autocomplete="tel"
                    inputmode="tel" />

                <label class="lbl">닉네임</label>
                <input class="inp" v-model.trim="form.nickname" type="text" autocomplete="nickname" />
            </form>

            <div class="actions">
                <button class="btn" :disabled="busy" @click="onUpdateProfile">개인정보 수정</button>
            </div>

            <h3 class="h3">비밀번호 변경</h3>

            <!-- form: submit 사용 + 숨김 username -->
            <form class="grid" autocomplete="on">
                <!-- 비번 매니저/접근성용 힌트 -->
                <input type="text" :value="userId" name="username" autocomplete="username" tabindex="-1"
                    aria-hidden="true" class="sr-only" />

                <label class="lbl">현재 비밀번호</label>
                <input class="inp" v-model.trim="pw.current" type="password" name="current-password"
                    autocomplete="current-password" placeholder="현재 비밀번호" />

                <label class="lbl">새 비밀번호</label>
                <input class="inp" v-model="pw.next" type="password" name="new-password" autocomplete="new-password"
                    placeholder="새 비밀번호 (8자 이상 권장)" />

                <label class="lbl">새 비밀번호 확인</label>
                <input class="inp" v-model="pw.next2" type="password" name="confirm-password"
                    autocomplete="new-password" placeholder="새 비밀번호 확인" />
            </form>
            <div class="actions">
                <button class="btn danger" :disabled="busy" type="submit" @click="onUpdatePassword">비밀번호 변경</button>
            </div>

            <p v-if="msg" class="msg">{{ msg }}</p>
            <p v-if="err" class="err">{{ err }}</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import { useAuth } from '@/composables/useAuth'

const auth = useAuthStore()
const { verifyPassword, updateProfile, updatePassword } = useAuth()

type UserSafe = {
    id?: string; _id?: string; username?: string; email?: string;
    phone?: string; nickname?: string; name?: string; role?: 'user' | 'admin'
}
const u = computed<UserSafe>(() => (auth.user as unknown as UserSafe) ?? {})

/** 비밀번호 폼에서 사용할 username 힌트 값(아이디/이메일 등) */
const userId = computed(() => u.value.username || u.value.email || '')

type ProfileForm = { email: string; phone: string; nickname: string }
type PwForm = { current: string; next: string; next2: string }

const form = reactive<ProfileForm>({
    email: u.value.email ?? '',
    phone: u.value.phone ?? '',
    nickname: u.value.nickname ?? (u.value.name ?? ''),
})
const pw = reactive<PwForm>({ current: '', next: '', next2: '' })

const unlocked = ref(false)
const checkPw = ref('')
const busy = ref(false)
const err = ref('')
const msg = ref('')

// 비밀번호 확인
async function onVerify() {
    err.value = ''; msg.value = ''
    if (!checkPw.value) { err.value = '비밀번호를 입력하세요.'; return }
    busy.value = true
    try {
        const res = await verifyPassword({ password: checkPw.value })
        const ok = (res as any)?.ok === true || (res as any)?.data?.ok === true
        if (!ok) { err.value = '비밀번호가 올바르지 않습니다.'; return }
        unlocked.value = true
    } catch {
        err.value = '확인 중 오류가 발생했습니다.'
    } finally {
        busy.value = false
    }
}

// 개인정보 수정
async function onUpdateProfile() {
    err.value = ''; msg.value = ''
    busy.value = true
    try {
        await updateProfile({
            email: form.email || '',
            phone: form.phone || '',
            nickname: form.nickname || '',
        })
        if (typeof (auth as any).fetchMe === 'function') await (auth as any).fetchMe()
        msg.value = '개인정보가 수정되었습니다.'
    } catch {
        err.value = '개인정보 수정에 실패했습니다.'
    } finally {
        busy.value = false
    }
}

// 비밀번호 변경
async function onUpdatePassword() {
    err.value = ''; msg.value = ''
    if (!pw.current || !pw.next || !pw.next2) { err.value = '모든 비밀번호 칸을 입력하세요.'; return }
    if (pw.next !== pw.next2) { err.value = '새 비밀번호가 일치하지 않습니다.'; return }
    if (pw.next.length < 8) { err.value = '새 비밀번호는 8자 이상을 권장합니다.'; return }

    busy.value = true
    try {
        await updatePassword({ currentPassword: pw.current, newPassword: pw.next })
        pw.current = pw.next = pw.next2 = ''
        msg.value = '비밀번호가 변경되었습니다.'
    } catch {
        err.value = '비밀번호 변경에 실패했습니다.'
    } finally {
        busy.value = false
    }
}
</script>

<style scoped>
/* 기존 클래스명 그대로 유지 */
.card {
    border: 1px solid #eee;
    border-radius: 14px;
    background: #fff;
    padding: 16px;
}

.h2 {
    font-size: 18px;
    font-weight: 800;
    margin: 0 0 6px;
}

.h3 {
    font-size: 16px;
    font-weight: 800;
    margin: 16px 0 8px;
}

.desc {
    color: #6b7280;
    margin: 0 0 10px;
}

.gate .row {
    display: flex;
    gap: 8px;
}

.form {
    display: grid;
    gap: 12px;
}

.grid {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 10px 12px;
    align-items: center;
}

.lbl {
    color: #6b7280;
}

.inp {
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
}

.btn {
    height: 40px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
}

.btn.primary {
    background: #111827;
    color: #fff;
    border-color: #111827;
}

.btn.danger {
    background: #ef4444;
    color: #fff;
    border-color: #ef4444;
}

.actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.err {
    color: #dc2626;
    margin-top: 6px;
}

.msg {
    color: #047857;
    margin-top: 6px;
}

/* 시각적 숨김(접근성 유지) — 새 클래스 추가 */
.sr-only {
    position: absolute !important;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
</style>

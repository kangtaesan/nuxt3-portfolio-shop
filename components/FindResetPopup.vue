<template>
    <div class="popup">
        <div class="inner">
            <!-- Header: 탭 전환 -->
            <div class="tabs">
                <button :class="{ active: activeTab === 'find-id' }" @click="activeTab = 'find-id'">
                    아이디 찾기
                </button>
                <button :class="{ active: activeTab === 'reset-password' }" @click="activeTab = 'reset-password'">
                    비밀번호 찾기
                </button>
            </div>

            <!-- Body: 탭에 따른 컴포넌트 표시 -->
            <div class="tab-content">
                <FindId v-if="activeTab === 'find-id'" />
                <ResetPassword v-else />
            </div>

            <!-- 닫기 버튼 -->
            <button class="close-btn" @click="$emit('close')">닫기</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import FindId from './find-reset/FindId.vue'
import ResetPassword from './find-reset/ResetPassword.vue';

const props = defineProps<{
    initialTab: 'find-id' | 'reset-password'
}>()
// 초기 탭 상태값 설정
const activeTab = ref<'find-id' | 'reset-password'>(props.initialTab)
// props 값이 변경될 때도 반영
watch(
    () => props.initialTab,
    (newVal) => {
        activeTab.value = newVal
    }
)

</script>

<style scoped>
.popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.popup .inner {
    background: #fff;
    width: 600px;
    padding: 20px;
    border-radius: 10px;
}

.tabs {
    display: flex;
    margin-bottom: 15px;
}

.tabs button {
    flex: 1;
    padding: 8px;
    border: none;
    color: #c0c0c0;
    border-bottom: 1px solid #c0c0c0;
    cursor: pointer;
}

.tabs .active {
    background: #fff;
    color: #4a90e2;
    border-top: 1px solid #c0c0c0;
    border-left: 1px solid #c0c0c0;
    border-right: 1px solid #c0c0c0;
    border-bottom: none;
}

.tab-content {
    min-height: 300px;
    max-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
}

.close-btn {
    margin-top: 15px;
    width: 100%;
    padding: 8px;
    background: #ddd;
    border: none;
    cursor: pointer;
}

@media (max-width: 480px) {
    .tab-content {
        min-height: 150px;
        padding: 15px;
    }
}
</style>
<template>
    <div>
        <Header></Header>
        <div class="admin">
            <!-- 좌측 메뉴 -->
            <aside class="sidebar">
                <ul>
                    <li>
                        <NuxtLink to="/admin/products">상품 등록/수정</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/admin/orders">주문 현황</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/admin/account">정보 수정</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/admin/cs">CS 문의</NuxtLink>
                    </li>
                </ul>
            </aside>
            <!-- 우측 컨텐츠 -->
            <div class="admin-contents">
                <slot />
            </div>
        </div>
    </div>

</template>

<script setup>

</script>

<style scoped>
.admin {
    display: flex;
    height: 90vh;
    margin-top: 65px;
}

.sidebar {
    width: 220px;
    background-color: #2c3e50;
    color: white;
    padding: 20px;
}

.sidebar ul {
    list-style: none;
    padding: 0;
}

.sidebar li {
    margin: 10px 0;
}

.sidebar a {
    color: white;
    text-decoration: none;
}

.sidebar a.router-link-active {
    font-weight: bold;
}

.admin-contents {
    flex: 1;
    padding: 20px;
}
</style>
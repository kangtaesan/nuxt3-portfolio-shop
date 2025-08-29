// scripts/make-hash.cjs
const bcrypt = require('bcryptjs');

const password = 'qwe123@@';
bcrypt.hash(password, 10).then(hash => {
    console.log('해시 비밀번호:', hash);
    process.exit(0);
});

// 터미널 실행: node scripts/make-hash.cjs
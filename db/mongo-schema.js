// ============================================================
// JmBox — MongoDB 스키마 & 쿼리 설계 문서
// Database: dramabox
// 실행: mongosh "<MONGODB_URI>" db/mongo-schema.js
// (또는 각 블록을 MongoDB Compass / Atlas Data Explorer에 복사해서 실행)
// ============================================================

use('dramabox');

// ------------------------------------------------------------
// 1. members 컬렉션 — 회원 계정 (api/auth/signup.ts, login.ts, members.ts)
// ------------------------------------------------------------
// 문서 스키마 (애플리케이션 레벨에서 강제, Mongo validator 없음):
// {
//   email: string,        // 소문자로 정규화, 고유값
//   passwordHash: string, // bcrypt 해시 (평문 비밀번호는 절대 저장 안 함)
//   nickname: string,
//   memberGrade: number,  // 1~7 (1=일반 ... 7=최고관리자)
//   isSuperAdmin: boolean,
//   createdAt: string,    // ISO 8601 날짜 문자열
// }

// email 중복 가입을 DB 레벨에서도 막기 위한 유니크 인덱스.
// (현재 앱 코드는 "조회 후 삽입" 방식이라 동시 가입 시 경합 가능성이
//  이론적으로 있음 — 이 인덱스가 최종 방어선 역할을 함)
db.members.createIndex({ email: 1 }, { unique: true });

// --- 회원가입 (POST /api/auth/signup) ---
// 1) 이메일 중복 확인
db.members.findOne({ email: 'user@example.com' });

// 2) 신규 회원 삽입 (SUPER_ADMIN_EMAIL과 일치하면 memberGrade=7)
db.members.insertOne({
  email: 'user@example.com',
  passwordHash: '$2a$10$...',   // bcrypt.hash(password, 10) 결과
  nickname: '닉네임',
  memberGrade: 1,
  isSuperAdmin: false,
  createdAt: new Date().toISOString(),
});

// --- 로그인 (POST /api/auth/login) ---
// 이메일로 조회 후, 애플리케이션에서 bcrypt.compare(입력비번, passwordHash) 검증
db.members.findOne({ email: 'user@example.com' });

// --- 관리자: 회원 목록 (GET /api/auth/members, ADMIN_API_SECRET 필요) ---
// 비밀번호 해시는 절대 응답에 포함하지 않음 (projection으로 제외)
db.members.find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 });

// --- 관리자: 등급 변경 (PATCH /api/auth/members) ---
db.members.updateOne(
  { email: 'user@example.com' },
  { $set: { memberGrade: 4, isSuperAdmin: false } }
);

// --- 관리자: 계정 삭제 (DELETE /api/auth/members) ---
// 최고관리자 이메일은 애플리케이션 코드에서 삭제 자체를 거부함
db.members.deleteOne({ email: 'user@example.com' });


// ------------------------------------------------------------
// 2. app_settings 컬렉션 — 광고 슬롯 / 드라마 배지 관리자 설정
//    (api/admin/settings.ts)
// ------------------------------------------------------------
// key-value 저장 방식. _id 자체가 설정 종류를 나타내는 키.
// {
//   _id: 'ad_slots',
//   value: AdSlot[]   // 광고 배너 배열
// }
// {
//   _id: 'drama_overrides',
//   value: { [bookId: string]: { badge?: string|null, deleted?: boolean } }
// }

// --- 조회 (GET /api/admin/settings, 인증 불필요 — 공개 데이터) ---
db.app_settings.find({ _id: { $in: ['ad_slots', 'drama_overrides'] } });

// --- 저장/갱신 (POST /api/admin/settings, ADMIN_API_SECRET 필요) ---
db.app_settings.updateOne(
  { _id: 'ad_slots' },
  { $set: { value: [ /* AdSlot[] 전체 배열 */ ] } },
  { upsert: true }
);

db.app_settings.updateOne(
  { _id: 'drama_overrides' },
  { $set: { value: { /* { [bookId]: { badge, deleted } } */ } } },
  { upsert: true }
);


// ------------------------------------------------------------
// 3. 현재 DB 상태 빠르게 확인하고 싶을 때
// ------------------------------------------------------------
print('--- collections ---');
db.getCollectionNames().forEach(name => {
  print(`${name}: ${db.getCollection(name).countDocuments()} docs`);
});

print('--- members (비밀번호 해시 제외) ---');
db.members.find({}, { projection: { passwordHash: 0 } }).forEach(printjson);

print('--- app_settings ---');
db.app_settings.find().forEach(printjson);

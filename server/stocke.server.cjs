/* server/stocke.server.cjs */
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.disable('x-powered-by');
app.use(cors({
  origin: ['http://localhost:5173','https://tossclone.netlify.app'],
  credentials: true
}));
app.use(express.json());

// ---- payments 라우터 로드(경로 유연 처리) ----
let paymentsRoutes;
try {
  // 같은 폴더에 있을 때
  paymentsRoutes = require(path.join(__dirname, 'payments.routes.cjs'));
} catch (e1) {
  try {
    // server/routes/ 에 있을 때
    paymentsRoutes = require(path.join(__dirname, 'routes', 'payments.routes.cjs'));
  } catch (e2) {
    console.error('[boot] payments.routes.cjs를 찾지 못했습니다.');
    throw e2;
  }
}
// ESM/CJS 혼용 방지 가드
paymentsRoutes = paymentsRoutes?.default ?? paymentsRoutes?.router ?? paymentsRoutes;
if (typeof paymentsRoutes !== 'function') {
  console.error('[boot] paymentsRoutes type =', typeof paymentsRoutes);
  throw new Error('payments.routes.cjs는 Express Router(함수) 하나만 export 해야 합니다.');
}

// ---- 헬스체크 ----
app.get('/', (_req, res) => res.status(200).send('ok'));
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// ---- 라우트 마운트(호출 금지) ----
app.use('/api', paymentsRoutes);

// ---- 서버 시작 ----
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('[boot] HTTP on :' + PORT);
});

// 안전 가드
process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

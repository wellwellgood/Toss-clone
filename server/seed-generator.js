import { fakerKO as faker } from "@faker-js/faker"; // npm i @faker-js/faker
import fs from "fs";

const COUNT = 200; // 생성할 결제 건수

const methods = ["card", "account", "point"];
const merchants = [
    "스타벅스", "CU", "GS25", "이마트24", "배달의민족",
    "카카오택시", "넷플릭스", "네이버페이", "쿠팡", "교보문고"
];

const payments = Array.from({ length: COUNT }).map((_, i) => {
    return {
        id: `pay_${i + 1}`,
        user_id: "u1",
        merchant: faker.helpers.arrayElement(merchants),
        amount: faker.number.int({ min: 1000, max: 100000 }),
        currency: "KRW",
        method: faker.helpers.arrayElement(methods),
        status: faker.helpers.arrayElement(["approved", "canceled"]),
        approved_at: faker.date.recent({ days: 90 }).toISOString()
    };
});

// 저장 경로
const outputPath = "./server/seed/payments.json";
fs.writeFileSync(outputPath, JSON.stringify(payments, null, 2), "utf-8");

console.log(`✅ ${COUNT}건 결제 데이터가 생성되어 ${outputPath} 에 저장됨`);

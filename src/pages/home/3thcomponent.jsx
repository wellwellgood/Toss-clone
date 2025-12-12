// src/pages/Home/3thcomponent.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "../../css/home/3th.module.css";
import { month, day } from "../../store/dateStore";
import Won from "../../img/Won.png";
import Card from "../../img/card.jpg";

export default function ThirdComponent({ payments = [] }) {
  const list = Array.isArray(payments) ? payments : [];

  const fmtKRW = (n) => (Number.isFinite(n) ? n.toLocaleString("ko-KR") : "0");

  const isApproved = (p) =>
    p?.status === "approved" && Number.isFinite(Number(p?.amount));
  const inThisMonth = (p) => {
    const raw = p?.approved_at ?? p?.created_at ?? p?.time;
    const d = new Date(raw);
    if (Number.isNaN(d)) return false;
    const now = new Date();
    return (
      d.getUTCFullYear() === now.getUTCFullYear() &&
      d.getUTCMonth() === now.getUTCMonth()
    );
  };

  const monthTotal = list.reduce(
    (s, p) => s + (isApproved(p) && inThisMonth(p) ? Number(p.amount) : 0),
    0
  );

  const cardTotal = list.reduce(
    (s, p) =>
      s +
      (isApproved(p) && inThisMonth(p) && p.method === "card"
        ? Number(p.amount)
        : 0),
    0
  );

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.usemonthmoney}>
        <div className={styles.month}>
          <div className={styles.text}>
            <div className={styles.img}>
              <img src={Won} alt="" />
            </div>
            <div className={styles.month1}>
              <div className={styles.monthmoney}>{fmtKRW(monthTotal)}원</div>
              <span className={styles.span}>{month}월달에 쓴 돈</span>
            </div>
          </div>
          <button className={styles.sendbtn}>내역</button>
        </div>
      </Link>

      <Link to="/" className={styles.usemonthmoney}>
        <div className={styles.cardprice}>
          <div className={styles.img2}>
            <img src={Card} alt="" />
          </div>
          <div className={styles.month1}>
            <div className={styles.monthmoney}>{fmtKRW(cardTotal)}원</div>
            <span className={styles.span}>
              {month}월{day}일에 낼 카드값
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

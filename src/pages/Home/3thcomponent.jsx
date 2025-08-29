import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../../css/home/3th.module.css";
import { month, day } from "../../store/dateStore";

import Won from "../../img/Won.png";
import Card from "../../img/card.jpg";

export default function ThirdComponent() {
  const [allPayments, setAllPayments] = useState([]);
  const [cardPayments, setCardPayments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://localhost:4000/api/payments");
      const data = await res.json();
      setAllPayments(data);
    };
    load();
  }, []);

  // 카드 결제만 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/payments/card");
        if (!res.ok) {
          setCardPayments([]);
          return;
        }
        const data = await res.json();
        setCardPayments(Array.isArray(data) ? data : []);
      } catch {
        setCardPayments([]);
      }
    };
    load();
  }, []);

  const total = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const cardTotal = cardPayments.reduce((s, p) => s + p.amount, 0);

  // const {month, day} = dateAccount();

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.usemonthmoney}>
        <div className={styles.month}>
          <div className={styles.text}>
            <div className={styles.img}>
              <img src={Won} alt="" />
            </div>
            <div className={styles.month1}>
              <div className={styles.monthmoney}>
                {total.toLocaleString()}원
              </div>
              <span className={styles.span}>{month}월달에 쓴 돈</span>
            </div>
          </div>
          <Link to="/" className={styles.firstbtn}>
            <button className="sendbtn">내역</button>
          </Link>
        </div>
      </Link>
      <Link to="/" className={styles.usemonthmoney}>
        <div className={styles.cardprice}>
          <div className={styles.img2}>
            <img src={Card} alt="" />
          </div>
          <div className={styles.month1}>
            <div className={styles.monthmoney}>{cardTotal.toLocaleString()}원</div>
            <span className={styles.span}>
              {month}월{day}일에 낼 카드값
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

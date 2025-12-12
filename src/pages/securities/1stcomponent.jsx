import React from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import styles from "../../css/securities/1stcomponent.module.css";
import { exchangemoney } from "../../store/exchangemoney";

import light from "./img/right.jpg";

export default function FirstComponent() {
  const reloadedAtRef = useRef(new Date());
  const { mvKRW, mvUSD } = exchangemoney();


  const reloadedAt = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(reloadedAtRef.current);

  return (
    <div className={styles.conainer}>
      <div className={styles.main}>
        <div className={styles.span}>
          <div className={styles.myaccunt}>
            <Link to="/">내 계좌보기</Link>
            <img src={light} alt="" />
          </div>
          <div className={styles.Time}>{reloadedAt}기준</div>
        </div>
        {/* 추후 수정(버튼(Link)이동) */}
        <div className={styles.price}>
          <div className={styles.woncontainer}>
            <Link to="/" alt="won" className={styles.won} />
            원화
            <span>{(mvKRW ?? 0).toLocaleString()}원</span>
          </div>
          <div className={styles.dolcontainer}>
            <Link to="/" alt="bol" className={styles.bol} />
            달러
            <span>${(mvUSD ?? 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

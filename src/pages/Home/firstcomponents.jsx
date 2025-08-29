import { useState, useEffect } from "react";
import { Dot } from "lucide-react";
import styles from "../../css/home/firstcomponent.module.css";
import img from "../../img/Toss_Symbol_Primary.png";
import { ChevronRight, StickyNote } from "lucide-react";
import { Link } from "react-router-dom";
// import  useNavigate  from "react-router-dom";
// import sendMoney from "";  //송금 컴포넌트 연결
import { useAccountStore } from "../../store/accountStore";

export default function FirstComponents( {payments}  ) {
  if (!payments) return null;
  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const { balance } = useAccountStore(); // 예시로 1000000원을 설정

  return (
    //통장 컴포넌트 연결
    <div className={styles.container}>
      <Link to="" className={styles.a1}>
        <div className={styles.FirstComponent}>
          <div className={styles.mainmoney}>
            <div className={styles.logo}>
              <img
                src={img}
                alt="logo"
                className={styles.logoimg}
                style={{ width: "24px", hight: "24px" }}
              />
            </div>
            <div className={styles.currency}>
              <div className={styles.money}>
                {balance}
                <span>원</span>
              </div>
              <div className={styles.account}>
                토스뱅크 통장 <Dot size={8} /> 주계좌
              </div>
            </div>
          </div>
          <Link to="" className={styles.firstbtn}>
            <button className="sendbtn">송금</button>
          </Link>
        </div>
      </Link>
      <span className={styles.line}></span>
      <Link to="" className={styles.a2}>
        <span>내 토스뱅크</span>
        <Link to="" className={styles.a3}>
          <div className={styles.interest}>
            <span>
              쌓인 이자 <span>원</span>
            </span>
            <ChevronRight size={16} />
          </div>
        </Link>
      </Link>
    </div>
  );
}

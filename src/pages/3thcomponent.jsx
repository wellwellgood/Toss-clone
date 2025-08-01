import { useState, useEffect } from "react";
import styles from "../css/3th.module.css";
import { FaWonSign } from "react-icons/fa";
import { IoCard } from "react-icons/io5";
import { useAccountStore } from '../store/accountStore';

export default function ThirdComponent() {
    const { balance } = useAccountStore();

    return (
        <div className={styles.container}>
            <a href="" className={styles.usemonthmoney}>
                <div className={styles.month}>
                    <div className={styles.text}>
                        <div className={styles.img}>
                            <FaWonSign size={24}/>
                        </div>
                        <div className={styles.month1}>
                            <div className={styles.monthmoney}>{balance}원</div>
                            <span className={styles.span}>{}월달에 쓴 돈</span>
                        </div>
                    </div>
                    <a href="" className={styles.firstbtn}>
                        <button className="sendbtn">내역</button>
                    </a>
                </div>
            </a>
            <a href="" className={styles.usemonthmoney}>
                <div className={styles.cardprice}>
                <div className={styles.img2}>
                    <IoCard size={24}/>
                </div>
                    <div className={styles.month1}>
                        <div className={styles.monthmoney}>{balance}원</div>
                        <span className={styles.span}>{}월{}일에 낼 카드값</span>
                    </div>
                </div>
            </a>
        </div>
    )
}
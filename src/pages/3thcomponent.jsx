import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import styles from "../css/3th.module.css";
import { FaWonSign } from "react-icons/fa";
import { IoCard } from "react-icons/io5";
import { month, day } from '../store/dateStore';

export default function ThirdComponent() {

    // const {month, day} = dateAccount();

    return (
        <div className={styles.container}>
            <Link to="/" className={styles.usemonthmoney}>
                <div className={styles.month}>
                    <div className={styles.text}>
                        <div className={styles.img}>
                            <FaWonSign size={24}/>
                        </div>
                        <div className={styles.month1}>
                            <div className={styles.monthmoney}>{}원</div>
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
                    <IoCard size={24}/>
                </div>
                    <div className={styles.month1}>
                        <div className={styles.monthmoney}>{}원</div>
                        <span className={styles.span}>{month}월{day}일에 낼 카드값</span>
                    </div>
                </div>
            </Link>
        </div>
    )
}
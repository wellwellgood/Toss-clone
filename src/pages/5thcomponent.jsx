import { Link } from 'react-router-dom';
import styles from "../css/5th.module.css";


import bag from "../img/moneyBag.jpg"
import bag2 from "../img/houseMoneyBag.jpg"
import per from "../img/percent.jpg"
import { FaChevronRight } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
export default function FifthComponent() {

    return (
        <div className={styles.container}>
            <div className={styles.item}>
                <Link to="/" className={styles.link}>
                    <div className={styles.main}>
                        <img src={bag} alt="" />
                        <span>내 대출 관리</span>
                    </div>
                    <Link to="">
                        <FaChevronRight size={10}/>
                    </Link>
                </Link>
            </div>

            <div className={styles.item}>
                <Link to="/" className={styles.link}>
                    <div className={styles.main}>
                        <img src={per} alt="" />
                        <span>할인<LuDot size="10"/>적립 쿠폰</span>
                    </div>
                    <Link to="">
                    <FaChevronRight size={10}/>
                    </Link>
                </Link>
            </div>

            <div className={styles.item}>
                <Link to="/" className={styles.link}>
                    <div className={styles.main}>
                        <img src={bag2} alt="" />
                        <span>종합부동산세 환급 받기</span>
                    </div>
                    <Link to="">
                    <FaChevronRight size={10}/>
                    </Link>
                </Link>
            </div>
        </div>
    )
}
import { Gauge } from 'lucide-react';
import styles from "../css/4th.module.css";
import { Link } from 'react-router-dom'; 


export default function FourthComponent() {

    return (
        <div className={styles.container}>
            <Link to="/" className={styles.a1}>
                <div className={styles.FourthComponent}>
                    <div className={styles.img}>
                        <Gauge size={24} />
                    </div>
                    <div className={styles.text}>내 신용점수</div>
                </div>
                <button className={styles.check}>확인하기</button>
            </Link>
            <span className={styles.line}></span>
            <div className={styles.buttonContainer}>
                <button>계좌계설</button>
                <span className={styles.bar}></span>
                <button>카드발급</button>
                <span className={styles.bar}></span>
                <button>대출받기</button>
            </div>
        </div>
    )
}
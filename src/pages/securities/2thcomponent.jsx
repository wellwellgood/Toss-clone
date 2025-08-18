import { Link } from 'react-router-dom';
import styles from '../../css/securities/2thcomponent.module.css';
import  Pofol  from '../../hooks/securitiesPoFol'


import right from './img/right.jpg';

export default function TwoThComponent() {
    const krw = Pofol({suffix: "원", showSign: true, digits:0});

    return (
        <div className={styles.container}>
            <Link 
                to ="/"
                className={styles.mystock}
                >
                <div className={styles.stock}>
                    내 종목 보기
                    <img src={right} alt="" />
                </div>
            </Link>
            <div className={styles.Account}>{}원</div>
            <div className={styles.holdPx}>{KRW.format(Math.round(evalv))}원</div>
        </div>
    )
}
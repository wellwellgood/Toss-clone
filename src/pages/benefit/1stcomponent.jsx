import { Link } from "react-router-dom";
import styles from '../../css/benefit/1stcomponent.module.css';


import shoe from './img/shoe.jpg';
import right from '../../img/right.jpg';

export default function FirstComponent() {


    return (
        <div className={styles.container1st}>
            <div className={styles.text}>
                <div className={styles.textspan}>
                    <span className={styles.sub}>받을 수 있는 혜택 1개</span>
                    <span className={styles.main}>만보기 복권</span>
                </div>
                <img src={shoe} alt="" />
            </div>
            <Link
                to="/"
                className={styles.link}
                >
                    당첨 확인하기
            </Link>
            <div className={styles.link2}>
                <div className={styles.linkspan}>
                    <span>친구와 함께 토스켜기</span>
                    <div className={styles.point}>
                        <span>포인트받기</span>
                        <img src={right} alt="" />
                    </div>
                </div>
                <div className={styles.linkspan}>
                    <span>고양이 키우고</span>
                    <div className={styles.point}>
                        <span>간식 받기</span>
                        <img src={right} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}
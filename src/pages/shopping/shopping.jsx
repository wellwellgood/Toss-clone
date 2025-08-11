import styles from '../../css/shopping/shopping.module.css';
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';



import Magnifier from './img/Magnifier.png';
import My from './img/My.png';
import cart from './img/cart.png';

export default function Shopping() {

    const navRef = useRef(null);
    const btnRefs = useRef([]);
    const [active, setActive] = useState(0);
    const [indicatorLeft, setIndicatorLeft] = useState(0);
    const [indicatorWidth, setIndicatorWidth] = useState(0);

    useEffect(() => {
        const btn = btnRefs.current[active];
        if (btn) {
          const { offsetLeft, offsetWidth } = btn;
          setIndicatorLeft(offsetLeft);
          setIndicatorWidth(offsetWidth);
          btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      }, [active])

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.recentProduct}>
                        <Link
                            to="/"
                            className={styles.recent}
                        >
                            <img src="" alt="" />
                            <span>최근 본 상품</span>
                            <img src="" alt="" />
                        </Link>
                    </div>
                    <div className={styles.headerbtn}>
                        <Link
                            to=""
                            >
                            <img src={Magnifier} alt="" />
                        </Link>
                        <Link
                            to=""
                            >
                            <img src={My} alt="" />
                        </Link>
                        <Link
                            to=""
                            >
                            <img src={cart} alt="" />
                        </Link>
                    </div>
                </div>
                <div className={styles.navmenu} ref={navRef}>
                {[
                    "쇼핑홈", "특가", "식품", "생활용품", "뷰티",
                    "패션", "주방용품", "전자제품", "반려동물", "자동차용품", "취미"
                ].map((label, idx) => (
                    <button
                    key={idx}
                    ref={(el) => (btnRefs.current[idx] = el)}
                    className={`${styles.navItem} ${active === idx ? styles.active : ""}`}
                    onClick={() => setActive(idx)}
                    >
                    {label}
                    </button>
                ))}
                <span
                    className={styles.indicator}
                    style={{ left: indicatorLeft, width: indicatorWidth }}
                />
                </div>
                <div className={styles.mainProduct}></div>
            </div>
            </div>
    )
}
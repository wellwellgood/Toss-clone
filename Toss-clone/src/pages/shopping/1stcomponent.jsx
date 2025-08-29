import styles from '../../css/shopping/1stcomponent.module.css';
import { Link } from 'react-router-dom';

// importing images
import Magnifier from './img/Magnifier.png';
import My from './img/My.png';
import cart from './img/cart.png';
export default function FirstComponent() {
    return (
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
        </div>
    )
}
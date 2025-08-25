import { Link } from "react-router-dom";
import styles from "../../css/securities/3thcomponent.module.css";

import star from "./img/4.png";
import ticket from "./img/5.png";
import fire from "./img/6.png";
import circle from "./img/7.png";
import right from "./img/right.jpg";

export default function ThreeThComponent() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <ul className={styles.list}>
          <Link to="" className={styles.Link}>
            <li className={styles.listitem}>
              <div className={styles.leftitem}>
                <img src={star} alt="" />
                <span>출석체크하고 추천받기</span>
              </div>
              <img src={right} alt="" />
            </li>
          </Link>
          <Link to="" className={styles.Link}>
            <li className={styles.listitem}>
              <div className={styles.leftitem}>
                <img src={ticket} alt="" />
                <span>오늘의 미션 확인하기</span>
              </div>
              <img src={right} alt="" />
            </li>
          </Link>
          <Link to="" className={styles.Link}>
            <li className={styles.listitem}>
              <div className={styles.leftitem}>
                <img src={fire} alt="" />
                <span>지금 핫한 주제별 커뮤니티</span>
              </div>
              <img src={right} alt="" />
            </li>
          </Link>
          <Link to="" className={styles.Link}>
            <li className={styles.listitem}>
              <div className={styles.leftitem}>
                <img src={circle} alt="" />
                <span>ETF 투자하기</span>
              </div>
              <img src={right} alt="" />
            </li>
          </Link>
          <Link to="/">
            <li>
              <img src="" alt="" />
              <span>다른 서비스 더 보기</span>
            </li>
          </Link>
        </ul>
      </div>
    </div>
  );
}

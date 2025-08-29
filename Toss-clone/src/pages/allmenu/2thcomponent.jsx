import styles from "../../css/allmenu/2thcomponent.module.css";
import { Link } from "react-router-dom";

// import image
import Untitled36 from "./img/Untitled36.png";

import Untitled37 from "./img/Untitled37.png";
import Untitled38 from "./img/Untitled38.png";
import Untitled39 from "./img/Untitled39.png";
import Untitled40 from "./img/Untitled40.png";
export default function SecondComponent() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.area1}>
          <span>편의</span>
          <div className={styles.item}>
            <Link to="">
              <div className={styles.back}>
                <img src={Untitled36} alt="" />
              </div>
              <span>내 토스인증서서</span>
            </Link>
          </div>
        </div>
        <div className={styles.area2}>
          <span>도움말</span>
          <div className={styles.item}>
            <Link to="">
              <div className={styles.back}>
                <img src={Untitled37} alt="" />
              </div>
              <span>토스 계정 통합 서비스</span>
            </Link>
            <Link to="">
              <div div className={styles.back}>
                <img src={Untitled38} alt="" />
              </div>
              <span>24시간 고객센터</span>
            </Link>
            <Link to="">
              <div div className={styles.back}>
                <img src={Untitled39} alt="" />
              </div>
              <span>토스 새소식</span>
            </Link>
            <Link to="">
              <div div className={styles.back}>
                <img src={Untitled40} alt="" />
              </div>
              <span>스크린리더 새소식</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

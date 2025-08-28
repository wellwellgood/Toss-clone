import { Link } from "react-router-dom";
import styles from "../../css/allmenu/allmenu.module.css";

import Magnifier from "./img/Magnifier.png";
import Setting from "./img/Setting.png";

import Untitled1 from "./img/Untitled1.png";
import Untitled3 from "./img/Untitled3.png";
import Untitled2 from "./img/Untitled2.png";
import Untitled5 from "./img/Untitled5.png";
import Untitled4 from "./img/Untitled4.png";

import FirstComponent from "./1thcomponent";
import SecondComponent from "./2thcomponent";
export default function Allmenu() {
  return (
    <div className={styles.container}>
      <div className={styles.allmenu}>
        <div className={styles.topbtn}>
          <img src={Magnifier} alt="" />
          <img src={Setting} alt="" />
        </div>
        <div className={styles.mainbtn}>
          <Link to="">고객센터</Link>
          <span></span>
          <Link to="">신분증·인증</Link>
          <span></span>
          <Link to="">토스뱅크</Link>
        </div>
        <div className={styles.area1}>
          <span>최근</span>
          <div className={styles.area1btn}>
            <li>
              <div className={styles.back}>
                <img src={Untitled1} alt="" />
              </div>
              <span>모바일 신분증</span>
            </li>
            <li>
              <div className={styles.back}>
                <img src={Untitled2} alt="" />
              </div>
              <span>조각투자</span>
            </li>
            <li>
              <div className={styles.back}>
                <img src={Untitled5} alt="" />
              </div>
              <span>게임</span>
            </li>
          </div>
        </div>
        <div className={styles.area2}>
          <span>추천</span>
          <div className={styles.area2btn}>
            <li>
              <div className={styles.back}>
                <img src={Untitled3} alt="" />
              </div>
              <span>이벤트 모아보기</span>
            </li>
            <li>
              <div className={styles.back}>
                <img src={Untitled4} alt="" />
              </div>
              <span>최저 금리 대출 찾기</span>
            </li>
          </div>
        </div>
      </div>
      <FirstComponent />
      <SecondComponent />
    </div>
  );
}

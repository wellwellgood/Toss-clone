import { useState, useEffect } from 'react';
import { useAccountStore } from '../store/accountStore';
import styles from '../css/Home.module.css';
import { Link } from 'react-router-dom';
import { NavLink } from "react-router-dom";


// importing images
import work1 from '../img/work.jpg';
import img1 from "../img/11.jpg";
import img2 from "../img/222.jpg";
import { FaChevronRight } from "react-icons/fa";
import payment from "../img/payment.png";
import main from "../img/main.jpg";
import Benefit from "../img/benefit.jpg";
import Securities from "../img/Securities.jpg";
import shopping from "../img/shopping.jpg";
import hamburger from "../img/hamburger.jpg";

// Importing components
import Loading from './loading';
import FirstComponents from './firstcomponents';
import TwoThComponent from './2thcomponent';
import ThreeThComponent from './3thcomponent';
import FourthComponent from './4thcomponent';
import FiveComponent from './5thcomponent';

export default function Home() {
  const {balance, owner, setAccount } = useAccountStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ mock 데이터 (API 흉내)
    setTimeout(() => {
      setAccount(120000, "김기윤"); // 잔액 + 사용자 mock 값
      setLoading(false);
    }, 2500); // 1.5초 후 로딩 완료
  }, [setAccount]);

  // ✅ 로딩 페이지
  if (loading) return <Loading />;

  return (
    <div className={styles.background}>
      <div className={styles.top}>
        <div className={styles.work}>
          <div className={styles.workTitle}>
            <img src={work1} alt="" />
            <span>할 일</span>
          </div>
          <Link to="#"><FaChevronRight size={12} /></Link>
        </div>
        <div className={styles.notify}>
        <Link to="/"><img src={payment} alt="" /></Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22 "
              fill="currentColor" className="size-6" color="#626979">
            <path fillRule="evenodd"
                  d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
                  clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <div className={styles.components}>
        <FirstComponents />
        <TwoThComponent />
        <ThreeThComponent />
        <FourthComponent />
        <div className={styles.text}>{owner}님을 위해 준비했어요</div>
          <div className={styles.container}>
              <div className={styles.img}>
                  <Link to="/">
                      <img
                      src={img1}
                      alt="" 
                      />
                  </Link>
              </div>
              <div className={styles.img}>
                  <Link to ="/">
                      <img 
                      src={img2}
                      alt=""
                      />
                  </Link>
              </div>
          </div>
          <FiveComponent />
      </div>
      <div className={styles.btncontainer}>
        <ul>
          <li>
            <NavLink
              to="/Home"
              className={({ isActive }) => isActive ? styles.active : ""}
              >
              <img src={main} alt="" />
              홈
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/benefit"
                className={({ isActive }) => isActive ? styles.active : ""}
              >
                <img src={Benefit} alt="" />
                혜택
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/shopping"
                className={({ isActive }) => isActive ? styles.active : ""}
              >
                <img src={shopping}/>
                토스쇼핑
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/securities"
                className={({ isActive }) => isActive ? styles.active : ""}
              >
                <img src={Securities}/>
                증권
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/all"
                className={({ isActive }) => isActive ? styles.active : ""}
              >
                <img src={hamburger} alt="" />
                전체
              </NavLink>
            </li>
          </ul>
      </div>
    </div>
  );
}

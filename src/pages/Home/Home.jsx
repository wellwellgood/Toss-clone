import { useState, useEffect } from 'react';
import { useAccountStore } from '../../store/accountStore';
import styles from '../../css/home/home.module.css';
import { Link, NavLink } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// importing images
import work1 from '../../img/work.jpg';
import img1 from "../../img/11.jpg";
import img2 from "../../img/222.jpg";
import { FaChevronRight } from "react-icons/fa";
import payment from "../../img/payment.png";
import main from "../../img/main.jpg";
import Benefit from "../../img/benefit.jpg";
import Securities from "../../img/Securities.jpg";
import shopping from "../../img/shopping.jpg";
import hamburger from "../../img/hamburger.jpg";

// importing components
import Loading from '../loading';
import FirstComponents from './firstcomponents';
import TwoThComponent from './2thcomponent';
import ThreeThComponent from './3thcomponent';
import FourthComponent from './4thcomponent';
import FiveComponent from './5thcomponent';

export default function Home() {
  const { balance, owner, setAccount } = useAccountStore();
  const [appLoading, setAppLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  // Step 1: App-level loading (logo animation)
  useEffect(() => {
    const alreadyLoaded = sessionStorage.getItem("appLoaded");
    if (alreadyLoaded) {
      setAppLoading(false);
      return;
    }
  
    const logoTimer = setTimeout(() => {
      setAppLoading(false);
      sessionStorage.setItem("appLoaded", "true");
    }, 2000);
  
    return () => clearTimeout(logoTimer);
  }, []);

  // Step 2: Skeleton loading
  useEffect(() => {
    if (!appLoading) {
      const dataTimer = setTimeout(() => {
        setAccount(120000, "김기윤");
        setDataLoading(false);
      }, 2000); // 2초 스켈레톤 로딩
      return () => clearTimeout(dataTimer);
    }
  }, [appLoading, setAccount]);

  if (appLoading) return <Loading />;

  return (
    <div className={styles.background}>
      <div className={styles.top}>
        {dataLoading ? (
          <Skeleton height={50} width={150} style={{ marginBottom: 16 }} />
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className={styles.components}>
        {dataLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} height={80} style={{ marginBottom: 16 }} />
          ))
        ) : (
          <>
            <FirstComponents />
            <TwoThComponent />
            <ThreeThComponent />
            <FourthComponent />
          </>
        )}

        <div className={styles.text}>
          {dataLoading ? <Skeleton width={200} height={30} /> : `${owner}님을 위해 준비했어요`}
        </div>

        <div className={styles.container}>
          {[img1, img2].map((img, i) => (
            <div className={styles.img} key={i}>
              {dataLoading ? (
                <Skeleton height={100} />
              ) : (
                <Link to="/">
                  <img src={img} alt={`추천${i + 1}`} />
                </Link>
              )}
            </div>
          ))}
        </div>

        {dataLoading ? (
          <Skeleton height={200} />
        ) : (
          <FiveComponent />
        )}
      </div>

      <div className={styles.btncontainer}>
        <ul>
          {[{
            to: "/Home",
            img: main,
            label: "홈"
          }, {
            to: "/benefit",
            img: Benefit,
            label: "혜택"
          }, {
            to: "/shopping",
            img: shopping,
            label: "토스쇼핑"
          }, {
            to: "/securities",
            img: Securities,
            label: "증권"
          }, {
            to: "/all",
            img: hamburger,
            label: "전체"
          }].map(({ to, img, label }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => isActive ? styles.active : ""}>
                <img src={img} alt={label} /> {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

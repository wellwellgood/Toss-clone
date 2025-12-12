// src/pages/Home/Home.jsx
import React from "react";
import { useState, useEffect } from "react";
import { useAccountStore } from "../../store/accountStore";
import styles from "../../css/home/Home.module.css";
import { Link, NavLink } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// importing images
import work1 from "../../img/work.jpg";
import img1 from "../../img/11.jpg";
import img2 from "../../img/222.jpg";
import { FaChevronRight } from "react-icons/fa";
import payment from "../../img/payment.png";

// importing components
import Loading from "../loading";
import FirstComponents from "./firstcomponents";
import TwoThComponent from "./2thcomponent";
import ThreeThComponent from "./3thcomponent";
import FourthComponent from "./4thcomponent";
import FiveComponent from "./5thcomponent";

export default function Home() {
  const { balance, owner, setAccount } = useAccountStore();
  const [appLoading, setAppLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  // ✅ 결제 내역 상태
  const [payments, setPayments] = useState([]);

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

  // Step 2: Skeleton loading + 데이터 fetch
  useEffect(() => {
    if (appLoading) return;

    const BASE = import.meta.env.VITE_API_BASE || "";
    const now = new Date();
    const ym = `${now.getUTCFullYear()}-${String(
      now.getUTCMonth() + 1
    ).padStart(2, "0")}`;
    const endpoint = `${BASE}/api/payments`;
    const cardEndpoint = `${BASE}/api/payments/card`;

    const getMockDelay = () => Math.random() * 1500 + 500;
    const controller = new AbortController();
    let cancelled = false;

    const fetchPayments = async () => {
      try {
        const res = await fetch(endpoint, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setPayments(Array.isArray(data) ? data : []);
        setAccount(120000, "김기윤");
      } catch (err) {
        if (cancelled) return;
        console.error("[payments] fetch failed:", err, endpoint);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    const timer = setTimeout(fetchPayments, getMockDelay());
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [appLoading, setAccount]);

  if (appLoading) return <Loading />;

  return (
    <div className={styles.background}>
      <div className={styles.top}>
        <div className={styles.work}>
          <div className={styles.workTitle}>
            <img src={work1} alt="" />
            <span>할 일</span>
          </div>
          <Link to="#">
            <FaChevronRight size={12} />
          </Link>
        </div>
        <div className={styles.notify}>
          <Link to="/">
            <img src={payment} alt="" />
          </Link>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 22 22 "
            fill="currentColor"
            className="size-6"
            color="#626979"
          >
            <path
              fillRule="evenodd"
              d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div className={styles.components}>
        <FirstComponents payments={payments} />
        <TwoThComponent />
        <ThreeThComponent payments={payments} />
        <FourthComponent />

        <div className={styles.text}>{owner}님을 위해 준비했어요</div>

        <div className={styles.container}>
          {[img1, img2].map((img, i) => (
            <div className={styles.img} key={i}>
              <Link to="/">
                <img src={img} alt={`추천${i + 1}`} />
              </Link>
            </div>
          ))}
        </div>

        <FiveComponent />
      </div>
    </div>
  );
}

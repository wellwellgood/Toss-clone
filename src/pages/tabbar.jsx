// tabbar.jsx
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "../css/tebbar.module.css";

import main from "../img/main.jpg";
import benefit from "../img/benefit.jpg";
import securities from "../img/Securities.jpg";
import shopping from "../img/shopping.jpg";
import hamburger from "../img/hamburger.jpg";

import mainBlack from "../img/main-black.jpg";
import benefitBlack from "../img/benefit-black.jpg";
import securitiesBlack from "../img/Securities-black.jpg";
import shoppingBlack from "../img/shopping-black.jpg";
import hamburgerBlack from "../img/hamburger-black.jpg";

import left from "./securities/img/left.png";
import heart from "./securities/img/heart.png";
import earth from "./securities/img/earth.png";
import chat from "./securities/img/chat.png";

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isSecurities = location.pathname.startsWith("/securities");
  const curSec = searchParams.get("stab") || "securities";

  // 메인탭 목록 (증권 포함)
  const tabItems = [
    { to: "/Home",       defaultImg: main,       activeImg: mainBlack,       label: "홈" },
    { to: "/benefit",    defaultImg: benefit,    activeImg: benefitBlack,    label: "혜택" },
    { to: "/shopping",   defaultImg: shopping,   activeImg: shoppingBlack,   label: "토스쇼핑" },
    // 증권은 쿼리까지 포함해 고정 이동
    { to: "/securities?stab=securities", defaultImg: securities, activeImg: securitiesBlack, label: "증권" },
    { to: "/all",        defaultImg: hamburger,  activeImg: hamburgerBlack,  label: "전체" },
  ];

  // 증권 서브탭 (증권 본체 제외)
  const secTabs = [
    { id: "watch",    label: "관심",  img: heart },
    { id: "discover", label: "발견",  img: earth },
    { id: "feed",     label: "피드",  img: chat },
  ];

  // ---------------- 뒤로가기: 마지막 메인탭으로 ----------------
  const [mainTabHistory, setMainTabHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("mainTabHistory");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    const isMain =
      location.pathname === "/Home" ||
      location.pathname === "/benefit" ||
      location.pathname === "/shopping" ||
      location.pathname === "/all";
    if (isMain) {
      setMainTabHistory(prev => {
        if (prev[prev.length - 1] !== location.pathname) {
          const updated = [...prev, location.pathname].slice(-10);
          localStorage.setItem("mainTabHistory", JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }
  }, [location.pathname]);

  const handleBackToMainTab = () => {
    const saved = localStorage.getItem("mainTabHistory");
    const arr = saved ? JSON.parse(saved) : mainTabHistory;
    const last = arr[arr.length - 1] || "/Home";
    navigate(last);
  };

  // ---------------- 서브탭 내부 bump 유지 ----------------
  const listRef = useRef(null);
  const prevSecRef = useRef(curSec);
  useEffect(() => {
    if (!isSecurities || !listRef.current) return;
    if (prevSecRef.current !== curSec) {
      const btn = listRef.current.querySelector(`[data-id="${curSec}"]`);
      if (btn) {
        btn.classList.remove(styles.pulse);
        requestAnimationFrame(() => {
          btn.classList.add(styles.pulse);
          setTimeout(() => btn.classList.remove(styles.pulse), 600);
        });
      }
      prevSecRef.current = curSec;
    }
  }, [isSecurities, curSec]);

  // ---------------- "증권" 버튼 위치 이동(FLIP) ----------------
  const wrapRef = useRef(null);
  const mainSecRef = useRef(null); // 메인바의 "증권"
  const subSecRef  = useRef(null); // 서브바의 "증권"(뒤로 다음)
  const floatRef   = useRef(null); // 이동용 플로팅

  const [moving, setMoving] = useState(false);
  const [hideMainSec, setHideMainSec] = useState(false);
  const [hideSubSec, setHideSubSec] = useState(true);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const floatEl = floatRef.current;
    const mainEl = mainSecRef.current;
    const subEl  = subSecRef.current;
    if (!wrap || !floatEl || !mainEl || !subEl) return;

    const fromEl = isSecurities ? mainEl : subEl;
    const toEl   = isSecurities ? subEl  : mainEl;

    const wrapRect = wrap.getBoundingClientRect();
    const fr = fromEl.getBoundingClientRect();
    const tr = toEl.getBoundingClientRect();

    const from = { x: fr.left - wrapRect.left, y: fr.top - wrapRect.top, w: fr.width, h: fr.height };
    const to   = { x: tr.left - wrapRect.left, y: tr.top - wrapRect.top, w: tr.width, h: tr.height };

    // 세팅
    floatEl.style.display = "block";
    floatEl.style.width = `${from.w}px`;
    floatEl.style.height = `${from.h}px`;
    floatEl.style.transform = `translate(${from.x}px, ${from.y}px)`;
    floatEl.style.opacity = "1";
    floatEl.style.transition = "none";

    // 실제 두 버튼 잠시 숨김(겹침 방지)
    setHideMainSec(true);
    setHideSubSec(true);
    setMoving(true);

    // 다음 프레임에서 목적지로
    requestAnimationFrame(() => {
      floatEl.style.transition = "transform 260ms ease, opacity 260ms ease";
      floatEl.style.transform = `translate(${to.x}px, ${to.y}px)`;
    });

    const done = () => {
      floatEl.style.display = "none";
      floatEl.style.transition = "none";
      setMoving(false);
      if (isSecurities) setHideSubSec(false);
      else setHideMainSec(false);
    };
    const t = setTimeout(done, 280);
    return () => clearTimeout(t);
  }, [isSecurities]);

  // ---------------- 진입 시에만 서브 나머지 순차 fade-in ----------------
  const [enterStamp, setEnterStamp] = useState(0);
  useEffect(() => {
    if (isSecurities) setEnterStamp(Date.now());
  }, [isSecurities]);

  return (
    <div className={`${styles.btncontainer} ${isSecurities ? styles.subMode : ""}`}>
      <nav role="tablist" aria-label="Bottom Tabs" className={styles.barWrap} ref={wrapRef}>

        {/* 메인탭 바 (서브 모드에선 숨김) */}
        <ul className={`${styles.bar} ${!isSecurities ? styles.show : styles.hide}`}>
          {tabItems.map(({ to, defaultImg, activeImg, label }) => {
            const isSec = label === "증권";
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  role="tab"
                  aria-label={label}
                  className={({ isActive }) => (isActive ? styles.active : "")}
                >
                  {({ isActive }) => (
                    <span
                      ref={isSec ? mainSecRef : null}
                      className={isSec
                        ? `${styles.mainSecBtn} ${hideMainSec ? styles.invisible : ""}`
                        : styles.mainBtn}
                    >
                      <img src={isActive ? activeImg : defaultImg} alt={label} />
                      {label}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* 서브탭 바 (30px 위로) */}
        <ul
          ref={listRef}
          className={`${styles.bar} ${isSecurities ? styles.showRaised : styles.hide}`}
          data-enter={enterStamp}
        >
          {/* 뒤로가기: 마지막 메인탭으로 */}
          <li>
            <button
              type="button"
              className={`${styles.secItem} ${styles.secBack}`}
              onClick={handleBackToMainTab}
            >
              <img src={left} alt="뒤로" />
            </button>
          </li>

          {/* 항상 보이는 "증권" (뒤로 다음) */}
          <li>
            <button
              type="button"
              className={`${styles.secItem} ${styles.secPrimary} ${hideSubSec ? styles.invisible : ""}`}
              ref={subSecRef}
              onClick={() => navigate(`/securities?stab=securities`)}
            >
              <img src={securitiesBlack} alt="증권" />
              증권
            </button>
          </li>

          {/* 나머지 서브탭: 진입 시 순차 fade-in, 복귀 시 즉시 사라짐 */}
          {secTabs.map((t, index) => {
            const active = t.id === curSec;
            return (
              <li
                key={t.id}
                className={styles.itemTransition}
                style={isSecurities ? { animationDelay: `${(index + 1) * 0.15}s` } : { animation: "none" }}
              >
                <button
                  type="button"
                  data-id={t.id}
                  role="tab"
                  aria-selected={active}
                  className={`${styles.secItem} ${active ? styles.active : ""}`}
                  onClick={() => navigate(`/securities?stab=${t.id}`)}
                >
                  <img src={t.img} alt={t.label} />
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* 하단 30px blur/mask (서브탭일 때만) */}
        {isSecurities && <div className={styles.blurUnderlay} aria-hidden="true" />}

        {/* "증권" 이동용 플로팅(FLIP) */}
        <div ref={floatRef} className={`${styles.floatingSec} ${moving ? styles.floatingOn : ""}`}>
          <button type="button" className={`${styles.secItem} ${styles.secPrimary}`}>
            <img src={securitiesBlack} alt="증권" />
            증권
          </button>
        </div>
      </nav>
    </div>
  );
}

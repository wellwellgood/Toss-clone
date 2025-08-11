import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import styles from '../../css/shopping/shopping.module.css';
import { Link } from 'react-router-dom';
import Magnifier from './img/Magnifier.png';
import My from './img/My.png';
import cart from './img/cart.png';

const LABELS = [
  '추천', '특가', '식품', '생활용품', '뷰피',
  '패션', '주방용품', '전자제품', '자동차용품', '취미'
];

export default function Shopping() {
  const navRef = useRef(null);
  const btnRefs = useRef([]);
  const [active, setActive] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    if (navRef.current) {
      navRef.current.scrollLeft = 0;
    }
  }, []);

  // 인디케이터 위치 업데이트
  useEffect(() => {
    const el = btnRefs.current[active];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);


  // 드래그 & 터치 스크롤 로직
  const dragging = useRef(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const onPointerDown = (e) => {
    const wrap = navRef.current;
    if (!wrap) return;
    isDown.current = true;
    dragging.current = false;
    startX.current = e.clientX;
    startScroll.current = wrap.scrollLeft;
    wrap.setPointerCapture?.(e.pointerId);
    wrap.classList.add(styles.grabbing);
  };
  const onPointerMove = (e) => {
    const wrap = navRef.current;
    if (!wrap || !isDown.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 3) dragging.current = true;
    wrap.scrollLeft = startScroll.current - dx;
    // ↓ 페이지로 스크롤 이벤트 전파 차단
    e.preventDefault();
    e.stopPropagation();
  };
  const onPointerUp = (e) => {
    const wrap = navRef.current;
    isDown.current = false;
    wrap?.releasePointerCapture?.(e.pointerId);
    wrap?.classList.remove(styles.grabbing);
  };

  const onItemClick = (idx, e) => {
    if (dragging.current) {
      e.preventDefault(); // 드래그 중 클릭 무효
      return;
    }
    setActive(idx);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.recentProduct}>
          <Link to="/" className={styles.recent}>
            <span>최근 본 상품</span>
          </Link>
        </div>
        <div className={styles.headerbtn}>
          <Link to=""><img src={Magnifier} alt="" /></Link>
          <Link to=""><img src={My} alt="" /></Link>
          <Link to=""><img src={cart} alt="" /></Link>
        </div>
      </div>

      <div
        className={styles.navmenu}
        ref={navRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
      {LABELS.map((label, idx) => (
          <button
            key={idx}
            ref={(el) => (btnRefs.current[idx] = el)}
            className={`${styles.navItem} ${active === idx ? styles.active : ''}`}
            onClick={(e) => onItemClick(idx, e)}
            type="button"
          >
            {label}
            </button>
        ))}
        <span
          className={styles.indicator}
          style={{ left: indicator.left, width: indicator.width }}
        />
      </div>
    </div>
  );
}

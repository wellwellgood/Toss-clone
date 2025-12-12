import React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function CategoryTabs({ labels, activeIndex, onChange }) {
  const wrapRef = useRef(null);
  const btnRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    wrapRef.current && (wrapRef.current.scrollLeft = 0);
  }, []);

  useEffect(() => {
    const el = btnRefs.current[activeIndex];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeIndex, labels]);

  // 드래그/스와이프 가로 스크롤
  const dragging = useRef(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const onPointerDown = (e) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    isDown.current = true;
    dragging.current = false;
    startX.current = e.clientX;
    startScroll.current = wrap.scrollLeft;
    wrap.setPointerCapture?.(e.pointerId);
    wrap.style.cursor = "grabbing";
  };
  const onPointerMove = (e) => {
    const wrap = wrapRef.current;
    if (!wrap || !isDown.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 3) dragging.current = true;
    wrap.scrollLeft = startScroll.current - dx;
    e.preventDefault();
    e.stopPropagation();
  };
  const onPointerUp = (e) => {
    const wrap = wrapRef.current;
    isDown.current = false;
    wrap?.releasePointerCapture?.(e.pointerId);
    wrap.style.cursor = "grab";
  };

  const onItemClick = (i, e) => {
    if (dragging.current) return; // 드래그 중 클릭 무시
    onChange?.(i);
  };

  return (
    <div
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "relative",
        display: "flex",
        gap: 12,
        overflowX: "auto",
        whiteSpace: "nowrap",
        padding: "8px 12px 10px",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        touchAction: "none",
        cursor: "grab",
        background: "#fff",
        scrollbehavior: "smooth",
      }}
    >
      {/* 탭들 */}
      {labels.map((label, i) => (
        <button
          key={label}
          ref={(el) => (btnRefs.current[i] = el)}
          onClick={(e) => onItemClick(i, e)}
          type="button"
          tabIndex={-1}
          style={{
            flex: "0 0 auto",
            minWidth: "max-content",
            border: 0,
            borderRadius: 999,
            padding: "8px 12px",
            fontSize: 14,
            color: i === activeIndex ? "#444" : "#666",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {label}
        </button>
      ))}

      {/* 밑줄 인디케이터 */}
      <span
        style={{
          position: "absolute",
          left: indicator.left,
          width: indicator.width,
          bottom: 0,
          height: 2,
          background: "#999",
          borderRadius: 1,
          pointerEvents: "none",
          transition: "left .25s ease, width .25s ease",
        }}
      />
    </div>
  );
}

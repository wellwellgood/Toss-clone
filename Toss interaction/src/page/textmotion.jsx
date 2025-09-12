// textmotion.jsx
import { memo, useMemo } from "react";
import m from "./motion.module.css";

export default memo(function TextMotion({
  text,
  unit = "char",
  preset = "fade",
  delayStep = 35,
  duration = 2000,
  delayBase = 0,   // 아이템 기준 딜레이
  delay,           // 개별 강제 딜레이(선택)
  distance = 16,
  baseDelay = 0,   // 컴포넌트 공통 오프셋
  className,
  as: Outer = "span",
  innerAs,
  gap = 3000,
  ...props
}) {
  const tokens = useMemo(() => {
    if (unit === "line") return text.split(/\r?\n/);
    if (unit === "word") return text.split(/(\s+)/);
    return Array.from(text);
  }, [text, unit]);

  const Item = innerAs || (unit === "line" ? "div" : "span");
  const presetClass = m[preset] ?? m.fade;

  const styleOf = (i) => {
    const base = typeof delay === "number" ? delay : delayBase;
    // const totalDelay = base + baseDelay + i * delayStep;
    return {
      "--d": `${base + baseDelay + i * delayStep}ms`,
      "--dur": `${duration}ms`,
      "--y": `${distance}px`,
      "--x": `${distance}px`,
      "--gap": `${gap}ms`,
    };
  };

  return (
    <Outer className={`${m.container} ${className || ""}`} {...props}>
      {tokens.map((t, i) => (
        <Item key={i} className={`${m.item} ${presetClass}`} style={styleOf(i)}>
          {unit === "word" ? (t === " " ? "\u00A0" : t) : t}
        </Item>
      ))}
    </Outer>
  );
});

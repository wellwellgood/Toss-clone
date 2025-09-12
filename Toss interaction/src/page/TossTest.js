// src/TossTest.js
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./TossTest.module.css";
import { IoIosArrowBack } from "react-icons/io";
import TextMotion from "./textmotion";

export default function TossTest() {
    const reward = [1500, 1000, 500];
    const total = reward.reduce((s, v) => s + v, 0);

    const [cycle, setCycle] = useState(0);
    const loopRef = useRef(null);

    // Hook은 컴포넌트 최상단에서만 호출해야 함
    useEffect(() => {
        const el = loopRef.current;
        if (!el) return;
        const onIter = () => setCycle((c) => c + 1);
        el.addEventListener("animationiteration", onIter);
        return () => el.removeEventListener("animationiteration", onIter);
    }, []);

    return (
        <div className={`allowMotion ${styles.container} ${styles.container2}`}>
            {/* 무한 루프 배경 */}
            <div ref={loopRef} className={styles.bgLoop} aria-hidden="true" />

            <div className={styles.header}>
                <span className={styles.icon}>
                    <IoIosArrowBack size={30} />
                </span>
            </div>

            <div className={styles.main}>
                {/* cycle 값이 바뀔 때마다 자식 블록이 재마운트 → TextMotion이 1회씩 다시 실행 */}
                <div key={cycle}>
                    <h1>
                        <TextMotion
                            as="span"
                            text="보험료 조회하면"
                            unit="word"
                            preset="slide"
                            delayStep={1}
                            distance={1}
                        />
                        <br />
                        <div className={styles.h1inner}>
                            <TextMotion
                                as="span"
                                text="총"
                                unit="char"
                                preset="fadeDiagSlide"
                                distance={5}
                                // delayBase={500}
                                delayStep={1}
                            />
                            <TextMotion
                                as="span"
                                text={`${total.toLocaleString()}원`}
                                unit="char"
                                preset="fadeDiagSlide"
                                distance={5}
                                className={styles.total}
                                delayStep={1}
                            />{" "}
                            <TextMotion
                                as="span"
                                text="받을 수 있어요"
                                unit="word"
                                preset="fadeDiagSlide"
                                distance={5}
                                // delayBase={500}
                                delayStep={1}
                            />
                        </div>
                    </h1>

                    <ul>
                        {reward.map((v, i) => (
                            <li key={i} className={styles.item}>
                                <TextMotion
                                    as="span"
                                    text="토스 보험"
                                    unit="char"
                                    preset="fadeDiagSlide"
                                    className={styles.brand}
                                    distance={3}
                                    gap={1000}
                                    delayBase={i * 100}
                                // delayStep={1}
                                />
                                <br />
                                <TextMotion
                                    as="span"
                                    text={`포인트 ${v.toLocaleString()}원`}
                                    unit="char"
                                    preset="fadeDiagSlide"
                                    distance={7}
                                    duration={2000}
                                    className={styles.amount}
                                    delayBase={i * 200}
                                    delayStep={30}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className={styles.footer}>
                <Link 
                to = "/"
                >
                    다음
                </Link>
                
            </div>
        </div>
    );
}

import { useState, useEffect, useRef } from "react";

export function useScroll(targetRef = null) {
    const [y, setY] = useState(0);
    const ticking = useRef(false);

    useEffect (() => {
        const el = targetRef?.current;
        const getY = () => el ? el.scrollTop : window.pageYOffset || document.documentElement.sctollTop || 0;

        const onScroll = () => {
            if(ticking.current) return;
            ticking.current = true;
            requestAnimationFrame(() => {
                setY(getY());
                ticking.current = false;
            })
        };

        onScroll();
        const t = el || window;
        t.addEventListener("scroll", onscroll, { passive: true});
        return () => t.removeEventListener("scroll", onScroll);
    }, [targetRef]);

    return y;
}
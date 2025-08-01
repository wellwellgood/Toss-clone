import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import img from "../img/Toss_Symbol_Primary.png";
import styles from "../css/loading.module.css";

function Loading() {
  const [fade, setFade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setFade(true), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`${styles.loadingScreen} ${fade ? styles.fadeOut : ""}`}>
      <img
        src={img}
        alt="Loading..."
        className={styles.logo}
      />
    </div>
  );
}

export default Loading;

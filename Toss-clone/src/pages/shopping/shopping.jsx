import { useState } from "react";
import CategoryTabs from "./CategoryTabs";
import ProductGrid from "./ProductGrid";
import { useProductsByLabel } from "../../hooks/useProductsByLabel";
import { Link } from "react-router-dom";
import styles from '../../css/shopping/shopping.module.css';
import TabBar from "../tabbar";



import Magnifier from './img/Magnifier.png';
import My from './img/My.png';
import cart from './img/cart.png';

const LABELS = [
  "쇼핑홈","특가","식품","생활용품","뷰티",
  "패션","주방용품","전자제품","반려동물","자동차용품","취미"
];

export default function Shopping() {
  const [activeIdx, setActiveIdx] = useState(0);
  const label = LABELS[activeIdx];
  const { items, loading, error } = useProductsByLabel(label, 12);

  return (
    <div style={{ minHeight: "100dvh", background: "#fff" }}>
        <div className={styles.header}>
                <div className={styles.recentProduct}>
                    <Link to="/" className={styles.recent}>
                    <span>최근 본 상품</span>
                    </Link>
                </div>
                <div className={styles.headerbtn}>
                    <Link to="/shopping"><img src={Magnifier}/></Link>
                    <Link to="/shopping"><img src={My} /></Link>
                    <Link to="/shopping"><img src={cart} /></Link>
                </div>
            </div>
      <div style={{ position: "sticky", top: 0, zIndex: 30 }}>
        <CategoryTabs
          labels={LABELS}
          activeIndex={activeIdx}
          onChange={setActiveIdx}
        />
      </div>

      <ProductGrid items={items} loading={loading} error={error} />
    </div>
  );
}

import { useLocation, NavLink } from "react-router-dom";
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

export default function TabBar() {
  const location = useLocation();

  const tabItems = [
    {
      to: "/Home",
      defaultImg: main,
      activeImg: mainBlack,
      label: "홈",
    },
    {
      to: "/benefit",
      defaultImg: benefit,
      activeImg: benefitBlack,
      label: "혜택",
    },
    {
      to: "/shopping",
      defaultImg: shopping,
      activeImg: shoppingBlack,
      label: "토스쇼핑",
    },
    {
      to: "/securities",
      defaultImg: securities,
      activeImg: securitiesBlack,
      label: "증권",
    },
    {
      to: "/all",
      defaultImg: hamburger,
      activeImg: hamburgerBlack,
      label: "전체",
    },
  ];

  return (
    <div className={styles.btncontainer}>
      <ul>
        {tabItems.map(({ to, defaultImg, activeImg, label }) => {
          const isActive = location.pathname === to;

          return (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => (isActive ? styles.active : "")}
              >
                <img src={isActive ? activeImg : defaultImg} alt={label} />
                {label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

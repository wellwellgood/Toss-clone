import { Link } from "react-router-dom";
import { rewardItems } from "./rewardItem";
import { image } from "./Imageimport";
import styles from "../../css/benefit/2stcomponent.module.css";
import { useAccountStore } from '../../store/accountStore';




export default function TwoComponent() {
  const { owner } = useAccountStore();

  return (
    <div className={styles.container1st}>
      <div className={styles.userbenefit}>
          {owner}님을 위한 추천 혜택
      </div>
      {rewardItems.map((item, idx) => (
        <Link
          to={item.to}
          key={idx}
          className={styles.item}
        >
          <div className={styles.main1}>
            <div className={styles.imgContainer}>
              <img src={image[item.key]} alt={item.title} className={styles.img} />
            </div>
  
            <div className={styles.text}>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.reward}>{item.reward}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
import { Link } from "react-router-dom";
import styles from "../../css/allmenu/1thcomponent.module.css";
import { btnItems } from "./btnitem";
import { image } from "./imageimport";

export default function FirstComponent() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <span>모든 서비스</span>
        {btnItems.map((item) => (
          <Link to={item.to} key={item.key} className={styles.item}>
            <div className={styles.main1}>
              <div className={styles.imgContainer}>
                <div className={styles.back}>
                  <img
                    src={image[item.key]}
                    alt={item.title}
                    className={styles.img}
                  />
                </div>
                <span className="font-Spoqa Han Sans Neo">
                  {item.title}
                </span>
              </div>

              <div className={styles.text}>
                <span className="text-gray-400 font-Spoqa Han Sans Neo">
                  {item.reward}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

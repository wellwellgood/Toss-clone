import { useState, useEffect } from 'react';
import { useAccountStore } from '../store/accountStore';
import styles from '../css/Home.module.css';
import { ChevronRight, StickyNote } from 'lucide-react';


// Importing components
import Loading from './loading';
import FirstComponents from './firstcomponents';
import TwoThComponent from './2thcomponent';
import ThreeThComponent from './3thcomponent';
import FourthComponent from './4thcomponent';

export default function Home() {
  const { balance, owner, setAccount } = useAccountStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ mock 데이터 (API 흉내)
    setTimeout(() => {
      setAccount(120000, "김기윤"); // 잔액 + 사용자 mock 값
      setLoading(false);
    }, 2500); // 1.5초 후 로딩 완료
  }, [setAccount]);

  // ✅ 로딩 페이지
  if (loading) return <Loading />;

  return (
    <div className={styles.background}>
      <div className={styles.top}>
        <div className={styles.work}>
          <div className={styles.workTitle}>
            <StickyNote size={16} color="#626979" />
            <span>할 일</span>
          </div>
          <a href="#"><ChevronRight size={16} />
          </a>
        </div>
        <div className={styles.notify}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="currentColor" className="size-6" color="#626979">
            <path fillRule="evenodd"
                  d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
                  clipRule="evenodd" />
          </svg>
        </div>
      </div>
            <FirstComponents />
            <TwoThComponent />
            <ThreeThComponent />
            <FourthComponent />

            <div>{owner} 님을 위해 준비했어요</div>
    </div>
  );
}

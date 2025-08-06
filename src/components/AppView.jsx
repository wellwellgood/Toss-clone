import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from '../pages/Home/Home';
import Benefit from '../pages/benefit/benefit';

export default function AppView() {
  const [view, setView] = useState('home');

  const direction = view === 'benefit' ? 1 : -1;

  const variants = {
    initial: (dir) => ({ x: dir * 100, opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: -dir * 100, opacity: 0 })
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={view}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-0 w-full h-full"
        >
          {view === 'home' ? (
            <Home onChangeView={setView} />
          ) : (
            <Benefit onChangeView={setView} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

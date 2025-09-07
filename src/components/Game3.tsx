import React, { useEffect, useState, useRef } from 'react';
import icon0m from '../assets/0m.png';
import icon1m from '../assets/1m.png';

const icons: { src: string; key: string }[] = [
  { src: icon0m, key: 'A' },
  { src: icon1m, key: 'B' }
];

function getRandomOrder() {
  return Math.random() > 0.5 ? icons : [...icons].reverse();
}

function getRandomFromPair(pair: typeof icons): typeof icons[0] {
  const idx = Math.random() > 0.5 ? 0 : 1;
  return pair[idx];
}

const maxRoundTime = 500;
const maxPointsToCorrect = maxRoundTime - 1;
const missPoints = 0;
const tooLatePoints = -1000;
const newRoundDelay = 550;
const startGameDelay = 50;

const Game3: React.FC = () => {
  const [bottomPair, setBottomPair] = useState<typeof icons>([]);
  const [showBottom, setShowBottom] = useState(false);
  const [topIcon, setTopIcon] = useState<typeof icons[0] | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [gamePoints, setGamePoints] = useState(0);
  const [roundPoints, setRoundPoints] = useState<number | null>(null);

  const answered = useRef(false);
  const tooLate = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const topShownAt = useRef<number>(0);

  // Function to start a new round
  const startNewRound = () => {
    setShowBottom(false);
    setShowTop(false);
    setRoundPoints(null);
    answered.current = false;
    tooLate.current = false;

    const bp = getRandomOrder();
    setBottomPair(bp);

    setTimeout(() => {
      setShowBottom(true);

      const ti = getRandomFromPair(bp);
      setTopIcon(ti);

      setTimeout(() => {
        setShowTop(true);
        topShownAt.current = performance.now();
      }, maxRoundTime);
    }, startGameDelay);
  };

  useEffect(() => {
    startNewRound();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (showTop && showBottom && topIcon && bottomPair.length === 2) {
      answered.current = false;
      tooLate.current = false;

      timeoutRef.current = setTimeout(() => {
        if (!answered.current) {
          tooLate.current = true;
          setRoundPoints(tooLatePoints);
          setGamePoints(prev => Math.max(prev + tooLatePoints, 0));
          setTimeout(startNewRound, newRoundDelay);
        }
      }, maxRoundTime);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (answered.current || tooLate.current) return;
        if (e.key === '0' || e.key === '1') {
          answered.current = true;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);

          const answerTime = performance.now() - topShownAt.current;
          const answerTimeMs = Math.min(Math.floor(answerTime), maxPointsToCorrect);
          // Log the time the user took to press 0 or 1
          console.log(`User took ${answerTimeMs} ms to answer`);
          
          let isCorrect = false;
          let points = 0;
          // 0 = right, 1 = left
          if (e.key === '0') {
            if (topIcon.key === bottomPair[1].key) {
              isCorrect = true;
              points = maxPointsToCorrect - answerTimeMs;
            } else {
              points = missPoints;
            }
          } else if (e.key === '1') {
            if (topIcon.key === bottomPair[0].key) {
              isCorrect = true;
              points = maxPointsToCorrect - answerTimeMs;
            } else {
              points = missPoints;
            }
          }

          setRoundPoints(points);
          setGamePoints(prev => Math.max(prev + points, 0));

          if (isCorrect) {
            console.log(`${e.key} clicked - it's right, +${points} points`);
          } else {
            console.log(`${e.key} clicked, missed, ${missPoints} points`);
          }

          setTimeout(startNewRound, newRoundDelay);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showTop, showBottom, topIcon, bottomPair]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem', position: "relative" }}>
      {/* Total game points at top center */}
      <div style={{
        position: "fixed",
        left: "50%",
        top: "32px",
        transform: "translate(-50%, 0)",
        fontSize: "2rem",
        fontWeight: "bold",
        color: "#2a80ff",
        zIndex: 2,
        background: "rgba(255,255,255,0.8)",
        padding: "0.25em 1em",
        borderRadius: "1em",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        Game Points: {gamePoints}
      </div>
      {/* Round points just above the icons */}
      <div style={{
        marginBottom: "0.5rem",
        height: "2rem",
        fontSize: "1.25rem",
        fontWeight: "bold",
        color: "#333",
      }}>
        {roundPoints !== null && (
          <>Round Points: {roundPoints}</>
        )}
      </div>
      {/* Top line: one PNG, centered */}
      <div style={{ height: 100, marginBottom: 30, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {showTop && topIcon &&
          <img src={topIcon.src} alt={topIcon.key} width={80} height={80} />
        }
      </div>
      {/* Bottom line: two PNGs, spaced */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, height: 100 }}>
        {showBottom && bottomPair.length === 2
          ? <>
              <img src={bottomPair[0].src} alt={bottomPair[0].key} width={80} height={80} />
              <img src={bottomPair[1].src} alt={bottomPair[1].key} width={80} height={80} />
            </>
          : <>
              <div style={{ width: 80, height: 80 }} />
              <div style={{ width: 80, height: 80 }} />
            </>
        }
      </div>
      <div style={{marginTop: "1rem"}}>
        <div><strong>Press 1 if top matches bottom left, 0 if top matches bottom right</strong></div>
        <div style={{marginTop: ".5rem", color: "gray"}}>You have {maxRoundTime} ms to answer!<br />Next round starts in {newRoundDelay} ms after you score.</div>
      </div>
    </div>
  );
};

export default Game3;
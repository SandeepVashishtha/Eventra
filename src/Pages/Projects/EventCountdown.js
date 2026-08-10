import useCountdown from "hooks/useCountdown";

/**
 * EventCountdown
 * Fix: replaced 30-line manual calculateTimeLeft + setInterval with useCountdown hook.
 * Added isMounted guard and server time support via the hook.
 */
const EventCountdown = ({ eventDate }) => {
  const { days, hours, minutes, seconds } = useCountdown(eventDate);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div style={styles.container}>
      <p style={styles.title}>⏳ Event Starts In:</p>
      <div style={styles.timerWrapper}>
        <div style={styles.timeBox}>
          <span style={styles.timeNum}>{formatNumber(days)}</span>
          <span style={styles.timeLabel}>Days</span>
        </div>
        <span style={styles.colon}>:</span>
        <div style={styles.timeBox}>
          <span style={styles.timeNum}>{formatNumber(hours)}</span>
          <span style={styles.timeLabel}>Hours</span>
        </div>
        <span style={styles.colon}>:</span>
        <div style={styles.timeBox}>
          <span style={styles.timeNum}>{formatNumber(minutes)}</span>
          <span style={styles.timeLabel}>Mins</span>
        </div>
        <span style={styles.colon}>:</span>
        <div style={styles.timeBox}>
          <span style={styles.timeNum}>{formatNumber(seconds)}</span>
          <span style={styles.timeLabel}>Secs</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '15px 20px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    display: 'inline-block',
    textAlign: 'center',
    margin: '15px 0',
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  title: {
    color: '#38bdf8',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '10px',
    marginTop: '0',
  },
  timerWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  timeBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '50px',
  },
  timeNum: {
    color: '#ffffff',
    fontSize: '1.6rem',
    fontWeight: '700',
    background: '#1e293b',
    padding: '6px 10px',
    borderRadius: '6px',
    minWidth: '40px',
    display: 'inline-block',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
  },
  timeLabel: {
    color: '#94a3b8',
    fontSize: '0.7rem',
    marginTop: '5px',
    textTransform: 'uppercase',
  },
  colon: {
    color: '#38bdf8',
    fontSize: '1.6rem',
    fontWeight: '700',
    paddingBottom: '20px',
  }
};

export default EventCountdown;

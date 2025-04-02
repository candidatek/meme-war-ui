import { useState, useEffect } from 'react';

function useCountdown(targetTimestamp: string | undefined) {
    const targetTime = Number(targetTimestamp);
    const [timeLeft, setTimeLeft] = useState(targetTime - Math.floor(Date.now() / 1000));
    const [warEnded, setWarEnded] = useState(false);
    const [endedTimeAgo, setEndedTimeAgo] = useState<string>('');

    useEffect(() => {
        const calculateTimeAgo = (timestamp: number) => {
            const now = Math.floor(Date.now() / 1000);
            const diffInSeconds = now - timestamp;

            if (diffInSeconds < 60) return 'just now';
            if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
            }
            if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            }
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        };

        if (timeLeft <= 0) {
            setWarEnded(true);
            setTimeLeft(0);
            setEndedTimeAgo(calculateTimeAgo(targetTime));
            return;
        }

        const intervalId = setInterval(() => {
            const currentTime = Math.floor(Date.now() / 1000);
            const remainingTime = targetTime - currentTime;

            if (remainingTime <= 0) {
                clearInterval(intervalId);
                setWarEnded(true);
                setTimeLeft(0);
                setEndedTimeAgo(calculateTimeAgo(targetTime));
            } else {
                setTimeLeft(remainingTime);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [targetTime, timeLeft]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return {
        timeLeft: targetTimestamp ? formatTime(timeLeft) : 0,
        warEnded,
        endedTimeAgo
    };
}

export default useCountdown;
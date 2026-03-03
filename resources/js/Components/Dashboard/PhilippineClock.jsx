import { useState, useEffect } from 'react';

export default function PhilippineClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const options = { timeZone: 'Asia/Manila' };

    const dateStr = time.toLocaleDateString('en-US', {
        ...options,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    const timeStr = time.toLocaleTimeString('en-US', {
        ...options,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    return (
        <div className="text-right">
            <p className="text-xs text-gray-400">{dateStr}</p>
            <p className="text-xl font-bold text-white tracking-wider font-mono">{timeStr}</p>
        </div>
    );
}

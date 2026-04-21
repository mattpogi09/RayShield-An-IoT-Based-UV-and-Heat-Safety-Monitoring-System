import { useState, useEffect } from 'react';

export default function PhilippineClock({ isNightMode = true }) {
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
        hour12: true,
    });

    return (
        <div className="text-right shrink-0">
            <p className={`hidden text-[11px] sm:block ${isNightMode ? 'text-gray-400' : 'text-slate-500'}`}>{dateStr}</p>
            <p className={`text-lg sm:text-xl font-bold tracking-wide font-mono whitespace-nowrap ${isNightMode ? 'text-white' : 'text-slate-800'}`}>{timeStr}</p>
        </div>
    );
}

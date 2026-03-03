export default function TemperatureCard({ temperature, unit, heatIndex, isNightMode }) {
    const unitSymbol = unit === 'celsius' ? '°C' : '°F';
    const tempValue = typeof temperature === 'number' ? temperature.toFixed(1) : '0.0';

    const getAdvice = () => {
        const tempC = unit === 'celsius' ? temperature : (temperature - 32) * 5 / 9;
        if (isNightMode && tempC < 25) return { text: 'Night cooling active', icon: '✧', color: 'text-purple-400' };
        if (tempC >= 40) return { text: 'Extreme heat danger', icon: '🔥', color: 'text-red-400' };
        if (tempC >= 35) return { text: 'Heat advisory active', icon: '⚠️', color: 'text-orange-400' };
        if (tempC >= 30) return { text: 'Stay hydrated', icon: '💧', color: 'text-yellow-400' };
        if (tempC >= 25) return { text: 'Comfortable range', icon: '✓', color: 'text-green-400' };
        return { text: 'Cool conditions', icon: '❄️', color: 'text-blue-400' };
    };

    const advice = getAdvice();

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#151a3d]/80 to-[#1a1f4e]/80 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a3 3 0 00-3 3v8.17a5 5 0 106 0V5a3 3 0 00-3-3zm0 2a1 1 0 011 1v9.59l.41.29a3 3 0 11-2.82 0l.41-.29V5a1 1 0 011-1z"/>
                </svg>
                <h3 className="text-white font-semibold">Temperature</h3>
            </div>

            <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">{tempValue}</span>
                <span className="text-xl text-gray-400">{unitSymbol}</span>
            </div>

            <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${advice.color} bg-white/5 border border-white/10`}>
                <span>{advice.icon}</span>
                <span>{advice.text}</span>
            </div>
        </div>
    );
}

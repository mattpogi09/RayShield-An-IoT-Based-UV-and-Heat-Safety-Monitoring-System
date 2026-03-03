export default function HumidityCard({ humidity, temperature }) {
    const humValue = typeof humidity === 'number' ? humidity.toFixed(0) : '0';

    const getAdvice = () => {
        // Calculate dew point approximation: Td ≈ T - ((100 - RH) / 5)
        const dewPoint = temperature - ((100 - humidity) / 5);
        const dewDiff = temperature - dewPoint;

        if (humidity >= 80) return { text: 'Very humid conditions', color: 'text-red-400' };
        if (dewDiff < 3) return { text: 'Dew point approaching', color: 'text-blue-400' };
        if (humidity >= 60) return { text: 'Moderate humidity', color: 'text-yellow-400' };
        if (humidity >= 30) return { text: 'Comfortable humidity', color: 'text-green-400' };
        return { text: 'Dry conditions', color: 'text-orange-400' };
    };

    const advice = getAdvice();

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#151a3d]/80 to-[#1a1f4e]/80 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <h3 className="text-white font-semibold">Humidity</h3>
            </div>

            <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">{humValue}</span>
                <span className="text-xl text-gray-400">%</span>
            </div>

            <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${advice.color} bg-white/5 border border-white/10`}>
                <span>{advice.text}</span>
            </div>
        </div>
    );
}

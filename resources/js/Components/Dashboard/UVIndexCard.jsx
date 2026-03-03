export default function UVIndexCard({ uvIndex, isNightMode, onClickDetail }) {
    const getUVLevel = (index) => {
        if (index >= 11) return { label: 'EXTREME', color: '#9333ea', ringColor: 'stroke-purple-500' };
        if (index >= 8) return { label: 'VERY HIGH', color: '#ef4444', ringColor: 'stroke-red-500' };
        if (index >= 6) return { label: 'HIGH', color: '#f97316', ringColor: 'stroke-orange-500' };
        if (index >= 3) return { label: 'MODERATE', color: '#eab308', ringColor: 'stroke-yellow-500' };
        if (index > 0) return { label: 'LOW', color: '#22c55e', ringColor: 'stroke-green-500' };
        return { label: 'NO UV RADIATION', color: '#6b7280', ringColor: 'stroke-gray-500' };
    };

    const level = getUVLevel(uvIndex);
    const maxUV = 15;
    const percentage = Math.min((uvIndex / maxUV) * 100, 100);
    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#151a3d]/80 to-[#1a1f4e]/80 backdrop-blur-sm p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <h2 className="text-white font-semibold text-lg">Ultraviolet Index</h2>
            </div>

            <div className="flex items-center justify-around">
                {/* UV Gauge */}
                <div className="relative">
                    {/* Click target for UVA/UVB detail */}
                    <button
                        onClick={onClickDetail}
                        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-purple-400/30 border border-purple-400/50 hover:bg-purple-400/50 transition-colors z-10"
                        title="View UVA/UVB details"
                    />

                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                        {/* Background circle */}
                        <circle
                            cx="100" cy="100" r="80"
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="12"
                        />
                        {/* Progress arc */}
                        <circle
                            cx="100" cy="100" r="80"
                            fill="none"
                            className={level.ringColor}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                        />
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-white">{Math.round(uvIndex)}</span>
                        <span className="text-xs text-gray-400 mt-1 tracking-wider">{level.label}</span>
                    </div>
                </div>

                {/* Night mode indicator or UV info */}
                {isNightMode ? (
                    <div className="text-center">
                        <svg className="w-12 h-12 text-purple-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <p className="text-white font-semibold">Night Mode Active</p>
                        <p className="text-gray-400 text-sm mt-1 max-w-[180px]">
                            UV levels are naturally zero after sunset.
                            Monitoring will resume at dawn.
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mb-3">
                            <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke={level.color} strokeWidth="2">
                                <circle cx="12" cy="12" r="5"/>
                                <line x1="12" y1="1" x2="12" y2="3"/>
                                <line x1="12" y1="21" x2="12" y2="23"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                <line x1="1" y1="12" x2="3" y2="12"/>
                                <line x1="21" y1="12" x2="23" y2="12"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                        </div>
                        <p className="text-white font-semibold">UV Monitoring Active</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Click the dot on the gauge<br/>to view UVA/UVB breakdown
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

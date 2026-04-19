export default function UVDetailModal({ uva, uvb, uvIndex, onClose, isNightMode }) {
    const getUVALevel = (val) => {
        if (val >= 200) return { label: 'Very High', color: 'text-red-400', bg: 'bg-red-400' };
        if (val >= 100) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-400' };
        if (val >= 50) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-400' };
        if (val > 0) return { label: 'Low', color: 'text-green-400', bg: 'bg-green-400' };
        return { label: 'None', color: 'text-gray-400', bg: 'bg-gray-400' };
    };

    const getUVBLevel = (val) => {
        if (val >= 80) return { label: 'Very High', color: 'text-red-400', bg: 'bg-red-400' };
        if (val >= 40) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-400' };
        if (val >= 20) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-400' };
        if (val > 0) return { label: 'Low', color: 'text-green-400', bg: 'bg-green-400' };
        return { label: 'None', color: 'text-gray-400', bg: 'bg-gray-400' };
    };

    const uvaLevel = getUVALevel(uva);
    const uvbLevel = getUVBLevel(uvb);

    const uvaPercent = Math.min((uva / 300) * 100, 100);
    const uvbPercent = Math.min((uvb / 100) * 100, 100);

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${isNightMode ? 'bg-black/60' : 'bg-slate-900/35'}`} onClick={onClose}>
            <div className={`w-full max-w-lg rounded-2xl p-6 ${isNightMode ? 'bg-[#1a1f4e] border border-white/10' : 'bg-white border border-slate-200 shadow-2xl'}`} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`font-bold text-lg flex items-center gap-2 ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        UV Radiation Breakdown
                    </h2>
                    <button onClick={onClose} className={`${isNightMode ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'} transition-colors`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* UV Index Summary */}
                <div className={`rounded-xl p-4 mb-6 text-center ${isNightMode ? 'bg-white/5' : 'bg-slate-50 border border-slate-200'}`}>
                    <p className={`text-xs mb-1 ${isNightMode ? 'text-gray-400' : 'text-slate-500'}`}>Combined UV Index</p>
                    <p className={`text-4xl font-bold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{typeof uvIndex === 'number' ? uvIndex.toFixed(1) : '0.0'}</p>
                </div>

                {/* UVA */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>UVA Radiation</h3>
                            <p className={`text-xs ${isNightMode ? 'text-gray-400' : 'text-slate-500'}`}>Long-wave (315–400nm) • Penetrates deep into skin</p>
                        </div>
                        <span className={`text-sm font-medium ${uvaLevel.color}`}>{uvaLevel.label}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`flex-1 rounded-full h-3 overflow-hidden ${isNightMode ? 'bg-white/5' : 'bg-slate-200'}`}>
                            <div
                                className={`h-full ${uvaLevel.bg} transition-all duration-500 rounded-full`}
                                style={{ width: `${uvaPercent}%`, opacity: 0.7 }}
                            />
                        </div>
                        <span className={`font-bold text-lg min-w-[60px] text-right ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                            {typeof uva === 'number' ? uva.toFixed(1) : '0.0'}
                        </span>
                    </div>

                    <div className={`mt-2 text-xs ${isNightMode ? 'text-gray-500' : 'text-slate-500'}`}>
                        <p>• Causes premature aging and wrinkles</p>
                        <p>• Can penetrate glass and clouds</p>
                        <p>• Present at relatively equal intensity throughout daylight</p>
                    </div>
                </div>

                {/* UVB */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>UVB Radiation</h3>
                            <p className={`text-xs ${isNightMode ? 'text-gray-400' : 'text-slate-500'}`}>Short-wave (280–315nm) • Burns skin surface</p>
                        </div>
                        <span className={`text-sm font-medium ${uvbLevel.color}`}>{uvbLevel.label}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`flex-1 rounded-full h-3 overflow-hidden ${isNightMode ? 'bg-white/5' : 'bg-slate-200'}`}>
                            <div
                                className={`h-full ${uvbLevel.bg} transition-all duration-500 rounded-full`}
                                style={{ width: `${uvbPercent}%`, opacity: 0.7 }}
                            />
                        </div>
                        <span className={`font-bold text-lg min-w-[60px] text-right ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                            {typeof uvb === 'number' ? uvb.toFixed(1) : '0.0'}
                        </span>
                    </div>

                    <div className={`mt-2 text-xs ${isNightMode ? 'text-gray-500' : 'text-slate-500'}`}>
                        <p>• Primary cause of sunburn</p>
                        <p>• Strongest between 10 AM and 4 PM</p>
                        <p>• Blocked by glass but not by clouds</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className={`w-full py-3 font-semibold rounded-lg transition-colors ${isNightMode ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'}`}
                >
                    Close
                </button>
            </div>
        </div>
    );
}

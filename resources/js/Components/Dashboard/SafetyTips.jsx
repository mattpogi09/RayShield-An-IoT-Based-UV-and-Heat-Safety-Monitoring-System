export default function SafetyTips() {
    const dos = [
        'Apply SPF 30+ sunscreen every 2 hours',
        'Wear wrap-around sunglasses (UV400)',
        'Seek shade between 10 AM and 4 PM',
        'Wear wide-brimmed hats and light clothing',
        'Stay hydrated with plenty of water',
    ];

    const donts = [
        "Don't ignore high UV index alerts",
        "Don't use expired sunscreen products",
        "Don't forget protection on cloudy days",
        "Don't stay in direct sun for long periods",
        "Don't neglect sensitive areas like ears/neck",
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Do's */}
            <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-[#151a3d]/80 to-[#1a1f4e]/80 backdrop-blur-sm p-6 relative overflow-hidden">
                {/* Background icon */}
                <div className="absolute top-4 right-4 opacity-20">
                    <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h3 className="text-green-400 font-bold text-sm tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    SAFETY DO'S
                </h3>

                <ul className="space-y-3">
                    {dos.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                            <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Don'ts */}
            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#151a3d]/80 to-[#1a1f4e]/80 backdrop-blur-sm p-6 relative overflow-hidden">
                {/* Background icon */}
                <div className="absolute top-4 right-4 opacity-20">
                    <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h3 className="text-red-400 font-bold text-sm tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    SAFETY DON'TS
                </h3>

                <ul className="space-y-3">
                    {donts.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                            <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

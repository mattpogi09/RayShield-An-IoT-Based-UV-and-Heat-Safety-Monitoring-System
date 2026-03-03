export default function StatusBanner({ uvIndex, isNightMode }) {
    const getStatus = () => {
        if (isNightMode) {
            return {
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                ),
                title: 'Night Surveillance Active',
                description: 'Solar radiation is zero. System is monitoring ambient temperature and humidity trends.',
                gradient: 'from-purple-900/40 to-indigo-900/40',
                border: 'border-purple-500/30',
                iconColor: 'text-purple-400',
            };
        }

        if (uvIndex >= 11) {
            return {
                icon: '☢️',
                title: 'EXTREME UV DANGER',
                description: `UV Index is ${uvIndex}. Avoid outdoor exposure. Seek immediate shelter.`,
                gradient: 'from-red-900/40 to-pink-900/40',
                border: 'border-red-500/40',
                iconColor: 'text-red-400',
            };
        }
        if (uvIndex >= 8) {
            return {
                icon: '⚠️',
                title: 'Very High UV Alert',
                description: `UV Index is ${uvIndex}. Minimize sun exposure between 10 AM and 4 PM. Protective measures required.`,
                gradient: 'from-orange-900/40 to-red-900/40',
                border: 'border-orange-500/30',
                iconColor: 'text-orange-400',
            };
        }
        if (uvIndex >= 6) {
            return {
                icon: '🔆',
                title: 'High UV Warning',
                description: `UV Index is ${uvIndex}. Apply sunscreen and wear protective clothing outdoors.`,
                gradient: 'from-yellow-900/40 to-orange-900/40',
                border: 'border-yellow-500/30',
                iconColor: 'text-yellow-400',
            };
        }
        if (uvIndex >= 3) {
            return {
                icon: '☀️',
                title: 'Moderate UV Levels',
                description: `UV Index is ${uvIndex}. Standard sun protection recommended for extended outdoor activities.`,
                gradient: 'from-green-900/40 to-teal-900/40',
                border: 'border-green-500/30',
                iconColor: 'text-green-400',
            };
        }

        return {
            icon: '✅',
            title: 'Low UV - Safe Conditions',
            description: 'UV levels are minimal. No special precautions needed for outdoor activities.',
            gradient: 'from-blue-900/40 to-cyan-900/40',
            border: 'border-blue-500/30',
            iconColor: 'text-blue-400',
        };
    };

    const status = getStatus();

    return (
        <div className={`rounded-xl border ${status.border} bg-gradient-to-r ${status.gradient} backdrop-blur-sm p-4`}>
            <div className="flex items-center gap-3">
                <span className={`text-2xl ${status.iconColor}`}>
                    {typeof status.icon === 'string' ? status.icon : status.icon}
                </span>
                <div>
                    <h3 className={`font-semibold ${status.iconColor}`}>{status.title}</h3>
                    <p className="text-sm text-gray-300">{status.description}</p>
                </div>
            </div>
        </div>
    );
}

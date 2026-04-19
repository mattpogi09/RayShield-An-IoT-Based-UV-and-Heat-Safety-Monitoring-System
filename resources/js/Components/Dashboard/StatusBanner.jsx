export default function StatusBanner({ uvIndex, isNightMode }) {
    if (!isNightMode && uvIndex < 3) {
        return null;
    }

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
                titleColor: 'text-purple-300',
                textColor: 'text-gray-300',
                panel: 'bg-transparent',
            };
        }

        if (uvIndex >= 11) {
            return {
                icon: '☢️',
                title: 'EXTREME UV DANGER',
                description: `UV Index is ${uvIndex}. Avoid outdoor exposure. Seek immediate shelter.`,
                gradient: 'from-red-100 to-rose-100',
                border: 'border-red-300',
                iconColor: 'text-red-600',
                titleColor: 'text-red-700',
                textColor: 'text-red-800/90',
                panel: 'bg-red-50/70',
            };
        }
        if (uvIndex >= 8) {
            return {
                icon: '⚠️',
                title: 'Very High UV Alert',
                description: `UV Index is ${uvIndex}. Minimize sun exposure between 10 AM and 4 PM. Protective measures required.`,
                gradient: 'from-orange-100 to-amber-100',
                border: 'border-orange-300',
                iconColor: 'text-orange-600',
                titleColor: 'text-orange-700',
                textColor: 'text-orange-900/80',
                panel: 'bg-orange-50/70',
            };
        }
        if (uvIndex >= 6) {
            return {
                icon: '🔆',
                title: 'High UV Warning',
                description: `UV Index is ${uvIndex}. Apply sunscreen and wear protective clothing outdoors.`,
                gradient: 'from-yellow-100 to-amber-100',
                border: 'border-yellow-300',
                iconColor: 'text-yellow-700',
                titleColor: 'text-amber-700',
                textColor: 'text-amber-900/80',
                panel: 'bg-yellow-50/70',
            };
        }
        if (uvIndex >= 3) {
            return {
                icon: '☀️',
                title: 'Moderate UV Levels',
                description: `UV Index is ${uvIndex}. Standard sun protection recommended for extended outdoor activities.`,
                gradient: 'from-emerald-100 to-teal-100',
                border: 'border-emerald-300',
                iconColor: 'text-emerald-600',
                titleColor: 'text-emerald-700',
                textColor: 'text-emerald-900/80',
                panel: 'bg-emerald-50/70',
            };
        }

        return {
            icon: '✅',
            title: 'Low UV - Safe Conditions',
            description: 'UV levels are minimal. No special precautions needed for outdoor activities.',
            gradient: 'from-blue-100 to-cyan-100',
            border: 'border-blue-300',
            iconColor: 'text-blue-600',
            titleColor: 'text-blue-700',
            textColor: 'text-blue-900/80',
            panel: 'bg-blue-50/80',
        };
    };

    const status = getStatus();

    return (
        <div className={`rounded-xl border ${status.border} bg-gradient-to-r ${status.gradient} backdrop-blur-sm p-4`}>
            <div className="flex items-center gap-3">
                <span className={`text-2xl ${status.iconColor} rounded-lg ${status.panel} px-2 py-1`}>
                    {typeof status.icon === 'string' ? status.icon : status.icon}
                </span>
                <div className="min-w-0">
                    <h3 className={`font-semibold ${status.titleColor || status.iconColor}`}>{status.title}</h3>
                    <p className={`text-sm ${status.textColor || 'text-gray-300'}`}>{status.description}</p>
                </div>
            </div>
        </div>
    );
}

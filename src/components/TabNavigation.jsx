import { Home, BarChart3, History } from 'lucide-react';

/**
 * 下部タブナビゲーション
 */
export default function TabNavigation({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'prediction', label: '予想生成', icon: Home },
        { id: 'statistics', label: '統計分析', icon: BarChart3 },
        { id: 'history', label: 'マイ履歴', icon: History },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 z-50">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${isActive
                                    ? 'text-indigo-400'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <Icon
                                size={24}
                                className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}
                            />
                            <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                                {tab.label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-0 w-12 h-1 bg-indigo-500 rounded-t-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

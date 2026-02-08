interface TrustScoreProps {
    score: number;
}

export function TrustScore({ score }: TrustScoreProps) {
    const percentage = (score / 10) * 100;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getScoreColor = () => {
        if (score >= 7) return "#10b981";
        if (score >= 4) return "#f59e0b";
        
        return "#ef4444";
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg className="transform -rotate-90" width="160" height="160">
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="12"
                    fill="none"
                />
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={getScoreColor()}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-white">
                    {score.toFixed(1)}
                </div>
                <div className="text-sm text-white/70">out of 10</div>
            </div>
        </div>
    );
}

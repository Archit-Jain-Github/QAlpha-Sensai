import React from "react";

interface TaskTypeMetricCardProps {
    title: string;
    count: number;
    completionRate: number;
    color: "blue" | "purple" | "amber" | "teal" | "indigo";
}

export default function TaskTypeMetricCard({
    title,
    count,
    completionRate,
    color,
}: TaskTypeMetricCardProps) {
    // Map color to the appropriate Tailwind CSS classes
    const colorMap = {
        blue: {
            text: "text-blue-400",
            bg: "bg-blue-500",
            border: "border-blue-900/30",
            overlay: "bg-blue-500/5",
            accent: "bg-blue-500/10",
        },
        purple: {
            text: "text-purple-400",
            bg: "bg-purple-500",
            border: "border-purple-900/30",
            overlay: "bg-purple-500/5",
            accent: "bg-purple-500/10",
        },
        amber: {
            text: "text-amber-400",
            bg: "bg-amber-500",
            border: "border-amber-900/30",
            overlay: "bg-amber-500/5",
            accent: "bg-amber-500/10",
        },
        teal: {
            text: "text-teal-400",
            bg: "bg-teal-500",
            border: "border-teal-900/30",
            overlay: "bg-teal-500/5",
            accent: "bg-teal-500/10",
        },
        indigo: {
            text: "text-indigo-400",
            bg: "bg-indigo-500",
            border: "border-indigo-900/30",
            overlay: "bg-indigo-500/5",
            accent: "bg-indigo-500/10",
        },
    };

    const completionPercentage = Math.round(completionRate * 100);

    return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#111] to-[#0c0c0c] rounded-xl border border-transparent hover:${colorMap[color].border} transition-colors group`}>
            <div className={`absolute inset-0 ${colorMap[color].overlay}`}></div>

            {/* Background completion indicator */}
            <div
                className={`absolute bottom-0 left-0 h-full ${colorMap[color].accent} transition-all duration-700`}
                style={{ width: `${completionPercentage}%` }}
            ></div>

            <div className="relative p-6 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    {/* task count container with fixed height */}
                    <div className="h-14 flex flex-col justify-center">
                        <div className={`text-lg xl:text-xl font-light ${colorMap[color].text} mb-1`}>{title}</div>

                    </div>
                    <div className="text-3xl xl:text-4xl font-light text-white">
                        {completionPercentage}%
                    </div>
                </div>

                <div className="text-xs text-gray-500">{count} task{count === 1 ? '' : 's'}</div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-gray-800/70 rounded-full overflow-hidden mt-2">
                    <div
                        className={`h-full ${colorMap[color].bg} rounded-full transition-all duration-700`}
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
} 
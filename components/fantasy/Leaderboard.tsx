type LeaderboardEntry = {
    userID: string;
    name: string;
    tag: string;
    image?: string | null;
    totalPoints: number;
    breakdown: { gameID: string; score: number }[];
};

export default function Leaderboard({ data }: { data: LeaderboardEntry[] }) {
    return (
        <div className="space-y-6">
            {data.map((entry, index) => (
                <div
                    key={entry.userID}
                    className="flex items-center justify-between bg-gradient-to-r from-vdcDark/90 to-vdcDark rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border-l-8 border-r-8 border-vdcRed"
                >
                    <div className="flex items-center space-x-5">
                        {entry.image && (
                            <img
                                src={entry.image}
                                alt={`${entry.name}'s avatar`}
                                className="w-14 h-14 rounded-full object-cover border-2 border-vdcRed"
                            />
                        )}

                        <div>
                            <div className="text-vdcWhite font-semibold text-xl font-montserrat tracking-wide">
                                #{entry.rank} — {entry.name}
                                <span className="text-vdcRed font-bold text-lg"> #{entry.tag}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-vdcRed font-bold text-2xl font-montserrat tracking-wide min-w-[120px]">
                            {entry.totalPoints.toFixed(2)}
                        </div>
                        <div className="text-sm italic text-white">pts</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

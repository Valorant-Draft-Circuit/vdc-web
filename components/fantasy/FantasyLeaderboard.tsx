'use client';

import { useEffect, useState } from 'react';
import Leaderboard from './Leaderboard';

type LeaderboardEntry = {
    userID: string;
    name: string;
    tag: string;
    totalPoints: number;
    breakdown: { gameID: string; score: number }[];
};

export default function FantasyLeaderboard() {
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const fetchLeaderboard = async (page: number) => {
        setLoading(true);
        const res = await fetch(`/api/fantasy/leaderboard?page=${page}&limit=${pageSize}`);
        const newData: LeaderboardEntry[] = await res.json();

        if (newData.length < pageSize) setHasMore(false);

        setData((prev) => {
            const seen = new Set(prev.map((entry) => entry.userID));
            const filteredNewData = newData.filter((entry) => !seen.has(entry.userID));
            return [...prev, ...filteredNewData];
        });

        setLoading(false);
    };

    useEffect(() => {
        fetchLeaderboard(0);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchLeaderboard(nextPage);
    };

    return (
        <section className="mx-auto max-w-4xl xl:max-w-6xl 2xl:max-w-7xl px-6 py-8 bg-vdcGrey dark:bg-vdcBlack rounded-2xl drop-shadow-lg text-vdcWhite space-y-8">
            <div className="mb-4">
                <h2 className="text-2xl font-bold italic mb-6 border-b border-vdcGreyLight pb-3 tracking-wide">
                    Leaderboard
                </h2>
            </div>

            <Leaderboard data={data} />

            {loading && page === 0 && (
                <div className="text-vdcGrey italic text-center">
                    Loading leaderboard...
                </div>
            )}

            {hasMore && !loading && (
                <div className="text-center">
                    <button
                        onClick={loadMore}
                        className="px-8 py-3 bg-vdcRed rounded-2xl font-semibold hover:bg-vdcWhite hover:text-vdcRed transition-colors shadow-md"
                    >
                        Load More
                    </button>
                </div>
            )}

            {!hasMore && !loading && (
                <div className="text-center text-vdcGrey italic select-none">
                    End of leaderboard
                </div>
            )}
        </section>
    );
}

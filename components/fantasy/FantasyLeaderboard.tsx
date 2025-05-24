import { useEffect, useState } from 'react';
import Leaderboard from './Leaderboard';

export default function FantasyLeaderboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const pageSize = 10;

    // Debounce the search term
    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timeout);
    }, [search]);

    // Fetch leaderboard when debounced search or page changes
    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            const res = await fetch(`/api/fantasy/leaderboard?page=${page}&limit=${pageSize}&search=${encodeURIComponent(debouncedSearch)}`);
            const json = await res.json();
            const newData = json.data;

            if (page === 0) {
                setData(newData);
            } else {
                const seen = new Set(data.map((entry) => entry.userID));
                const filtered = newData.filter((entry) => !seen.has(entry.userID));
                setData((prev) => [...prev, ...filtered]);
            }

            if (newData.length < pageSize) setHasMore(false);
            setLoading(false);
        };

        fetchLeaderboard();
    }, [page, debouncedSearch]);

    const loadMore = () => setPage((p) => p + 1);

    return (
        <section>
            <input
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0); // Reset page when search changes
                    setHasMore(true);
                }}
                className="mb-4 px-4 py-2 rounded bg-vdcGrey text-white w-full"
                placeholder="Search IGN..."
            />

            <Leaderboard data={data} />

            {loading && <p className="text-center text-vdcGrey italic">Loading...</p>}

            {!loading && hasMore && (
                <div className="text-center">
                    <button onClick={loadMore} className="px-6 py-2 bg-vdcRed text-white rounded">
                        Load More
                    </button>
                </div>
            )}

            {!hasMore && <p className="text-center text-vdcGrey italic">End of leaderboard</p>}
        </section>
    );
}

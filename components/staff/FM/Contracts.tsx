"use client";

import StatsTable from "@/components/stats/StatsTable";
import { useEffect, useState } from "react";

export default function Contracts() {
    const [data, setData] = useState();
    useEffect(() => {
        async function fetchStats() {
            try {
            const res = await fetch(
                `/api/internal/FM`
            );
            if (!res.ok) {
                throw new Error(`Error fetching stats: ${res.status}`);
            }
            const data = await res.json();
            setData(data);
            } catch (err) {
            console.error(err);
            }
        }
        fetchStats();
    }, []);
    return <StatsTable data={data} />
}
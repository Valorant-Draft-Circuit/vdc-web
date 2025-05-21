'use client';

import { useState } from 'react';
import YourTeam from '@/components/fantasy/YourTeam';
import FantasyLeaderboard from '@/components/fantasy/FantasyLeaderboard';
import TeamBuilder from '@/components/fantasy/TeamBuilder';

const tabs = ['Your Team', 'Leaderboard', 'Team Builder'];

export default function FantasyPage() {
    const [activeTab, setActiveTab] = useState('Your Team');

    return (
        <section className="mx-auto max-w-4xl xl:max-w-6xl 2xl:max-w-7xl px-6 py-8 bg-vdcGrey dark:bg-vdcBlack rounded-2xl drop-shadow-lg text-vdcWhite">
            <div className="mb-8">
                <h1 className="text-3xl font-bold italic font-montserrat uppercase tracking-wide text-vdcWhite">
                    Fantasy League
                </h1>
            </div>

            {/* Tabs */}
            <nav className="flex space-x-8 border-b border-vdcGrey mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 border-b-4 transition-colors font-semibold text-lg tracking-wide ${activeTab === tab
                            ? 'border-vdcRed text-vdcRed'
                            : 'border-transparent text-vdcGreyLight hover:text-vdcWhite'
                            }`}
                        aria-current={activeTab === tab ? 'page' : undefined}
                    >
                        <span className="italic">{tab}</span>
                    </button>
                ))}
            </nav>

            {/* Tab Content */}
            <div className="mt-2 min-h-[400px]">
                {activeTab === 'Your Team' && <YourTeam />}
                {activeTab === 'Leaderboard' && <FantasyLeaderboard />}
                {activeTab === 'Team Builder' && <TeamBuilder />}
            </div>
        </section>
    );
}

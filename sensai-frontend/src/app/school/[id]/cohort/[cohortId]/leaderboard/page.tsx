import { Metadata } from 'next';
import ClientLeaderboardView from './ClientLeaderboardView';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
    title: 'Leaderboard',
    description: 'View the performance of all members in this cohort.',
};

async function getCohortName(cohortId: string) {
    try {
        // Replace with your actual API endpoint
        const res = await fetch(`${process.env.BACKEND_URL}/cohorts/${cohortId}`, {
            headers: {
                Cookie: cookies().toString()
            }
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.name;
    } catch (error) {
        console.error("Error fetching cohort name:", error);
        return null;
    }
}

export default async function LeaderboardPage({
    params,
}: {
    params: { id: string; cohortId: string };
}) {
    // Fetch the cohort name on the server
    const cohortName = await getCohortName(params.cohortId);

    return <ClientLeaderboardView
        cohortId={params.cohortId}
        cohortName={cohortName}
        view='learner'
    />;
} 
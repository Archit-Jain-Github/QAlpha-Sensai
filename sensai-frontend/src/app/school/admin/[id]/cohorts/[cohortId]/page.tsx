import ClientCohortPage from '@/app/school/admin/[id]/cohorts/[cohortId]/ClientCohortPage';
import { redirect } from 'next/navigation';

export default function CohortPage({ params }: { params: { id: string, cohortId: string } }) {
    // If cohortId is undefined or the string 'undefined', redirect to the school page
    if (!params.cohortId || params.cohortId === 'undefined') {
        console.error("Invalid cohortId in URL:", params.cohortId);
        redirect(`/school/admin/${params.id}#cohorts`);
    }

    return <ClientCohortPage schoolId={params.id} cohortId={params.cohortId} />;
} 
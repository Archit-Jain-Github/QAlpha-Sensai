"use client";

import ClientSchoolAdminView from './ClientSchoolAdminView';
import { useParams } from 'next/navigation';

export default function SchoolPage() {
    // Use the proper Next.js hook to get route parameters
    const params = useParams();
    const id = params.id as string;

    return <ClientSchoolAdminView id={id} />;
} 
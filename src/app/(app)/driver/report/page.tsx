
'use client';

import { Suspense } from 'react';
import { ReportClient } from './report-client';


export default function ReportPage() {
    return (
        <Suspense fallback={<div className="text-center p-8">Loading Report...</div>}>
            <ReportClient />
        </Suspense>
    );
}

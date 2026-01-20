"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import { toast } from 'sonner';
import { Job } from '@/lib/dummyData';
import JobForm from '@/components/dashboard/JobForm';

export default function JobEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { jobs, updateJob, currentCompanyId } = useAppStore();
    const [job, setJob] = useState<Job | null>(null);

    // Resolve params for Next.js 15+ (if needed), but standard is fine for now
    const [jobId, setJobId] = useState<string>('');

    useEffect(() => {
        // Handle params being a Promise in newer Next.js versions if necessary, 
        // but typically params is an object here.
        // Assuming params is directly available or we can use React.use() in server components,
        // but this is a client component.
        // For safety/compatibility with potential async params in Next.js 15:
        Promise.resolve(params).then(p => setJobId(p.id));
    }, [params]);

    useEffect(() => {
        if (!jobId) return;
        const found = jobs.find(j => j.id === jobId);
        if (found) {
            setJob(found);
        } else {
            toast.error('求人が見つかりませんでした');
            router.push('/dashboard/company/jobs');
        }
    }, [jobId, jobs, router]);

    const handleSubmit = (data: Partial<Job>) => {
        if (!job) return;

        updateJob(job.id, {
            ...data
        });

        toast.success('求人情報を更新しました');
        router.push('/dashboard/company/jobs');
    };

    if (!job) return <div className="p-10 text-center">読み込み中...</div>;

    // Verify ownership
    if (job.companyId !== currentCompanyId) {
        return <div className="p-10 text-center text-red-500 font-bold">編集権限がありません</div>;
    }

    return <JobForm initialData={job} onSubmit={handleSubmit} submitLabel="更新する" />;
}

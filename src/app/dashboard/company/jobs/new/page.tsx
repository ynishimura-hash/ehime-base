"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import { toast } from 'sonner';
import { Job } from '@/lib/dummyData';
import JobForm from '@/components/dashboard/JobForm';

export default function JobNewPage() {
    const router = useRouter();
    const { addJob, currentCompanyId } = useAppStore();

    const handleSubmit = (data: Partial<Job>) => {
        const newJob: Job = {
            id: `job_${Date.now()}`,
            companyId: currentCompanyId,
            title: data.title || '',
            category: data.category || '中途',
            tags: data.tags || [],
            salary: data.reward || '', // Mapping reward to salary for display consistency
            location: data.location || '松山市',
            type: (data as any).type || 'job', // Ensure type is passed
            workStyle: '出社', // Default or add to form
            description: data.description || '',
            requirements: data.requirements || '',
            holidays: data.holidays || '',
            welfare: data.welfare || '',
            selectionProcess: data.selectionProcess || '',
            // Add other fields mapping if necessary
            image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=300', // Default image
            matchLevel: 0, // Default
            createdAt: new Date().toISOString(),
            status: 'public', // Default status
            ...data
        } as Job;

        addJob(newJob);

        toast.success('求人を公開しました');
        router.push('/dashboard/company/jobs');
    };

    return <JobForm onSubmit={handleSubmit} submitLabel="公開する" />;
}

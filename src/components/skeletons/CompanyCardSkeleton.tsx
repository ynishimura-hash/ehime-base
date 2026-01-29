import { Skeleton } from "@/components/ui/skeleton";

export function CompanyCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="relative aspect-video bg-slate-200">
                <Skeleton className="w-full h-full" />
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                    <Skeleton className="h-7 w-3/4 mb-2" />
                    <div className="flex items-center gap-2 flex-wrap">
                        <Skeleton className="h-6 w-24 rounded-md" />
                        <Skeleton className="h-6 w-32 rounded-md" />
                    </div>
                </div>

                <div className="space-y-2 mb-6 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                <div className="flex justify-end items-center gap-2 border-t border-slate-100 pt-4">
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </div>
    );
}

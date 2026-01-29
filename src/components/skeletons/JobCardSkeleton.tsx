import { Skeleton } from "@/components/ui/skeleton";

export function JobCardSkeleton() {
    return (
        <div className="bg-white rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 mb-4">
            <div className="w-full md:w-80 shrink-0">
                <div className="space-y-2">
                    <Skeleton className="aspect-video w-full rounded-2xl" />
                    <div className="grid grid-cols-3 gap-2">
                        <Skeleton className="aspect-video rounded-xl" />
                        <Skeleton className="aspect-video rounded-xl" />
                        <Skeleton className="aspect-video rounded-xl" />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col pr-12 md:pr-16">
                <div className="mb-1">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Skeleton className="h-3 w-4" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <Skeleton className="h-6 w-16 rounded-lg" />
                    <Skeleton className="h-6 w-20 rounded-lg" />
                    <Skeleton className="h-6 w-12 rounded-lg" />
                </div>

                <div className="flex flex-wrap gap-3 mb-5">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-32 rounded-lg" />
                    <Skeleton className="h-8 w-28 rounded-lg" />
                </div>

                <div className="mt-auto">
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

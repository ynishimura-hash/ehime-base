import { Skeleton } from "@/components/ui/skeleton";

export function QuestCardSkeleton() {
    return (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="relative aspect-[16/10] bg-slate-100">
                <Skeleton className="w-full h-full" />
                <div className="absolute top-4 left-4">
                    <Skeleton className="h-6 w-16 rounded-md" />
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                </div>

                <Skeleton className="h-6 w-full mb-4" />

                <div className="mt-auto space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex -space-x-2">
                            <Skeleton className="w-6 h-6 rounded-full" />
                            <Skeleton className="w-6 h-6 rounded-full" />
                            <Skeleton className="w-6 h-6 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-12" />
                    </div>
                </div>
            </div>
        </div>
    );
}

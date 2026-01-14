import { AssignmentGroupTopicResponse } from "@/types/assignmentGroupTopic";
import { AlertTriangle, BookOpen, CheckCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { AssignmentGroupApprovalStatus } from "@/types/assignmentGroup";

interface SelectedTopicDisplayProps {
    topic: AssignmentGroupTopicResponse;
}

export const SelectedTopicDisplay = ({ topic }: SelectedTopicDisplayProps)  => {
    const t = useTranslations();
    // Số lượng nhóm đã đăng ký chủ đề này
    const groupCount = topic.approvalRequests?.filter((request) => request.status !== AssignmentGroupApprovalStatus.Rejected)?.length || 0;
    const isFull = groupCount >= topic.maxGroupsPerTopic;

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-lg space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2 text-secondary-700 dark:text-secondary-500">
                <CheckCircle className="w-5 h-5 shrink-0" />
                {t("current_selected_topic")} 
            </h3>
            
            <div className="flex flex-col items-start gap-2">
                {/* Title */}
                <div className="flex items-center gap-3 w-full">
                    <BookOpen className="w-6 h-6 text-primary shrink-0" />
                    <span className="font-extrabold text-xl text-foreground">{topic.title}</span>
                </div>

                {/* Description */}
                {topic.description && (
                    <p className="text-sm text-muted-foreground mt-1 pl-9 whitespace-pre-wrap">
                        {topic.description}
                    </p>
                )}

                {/* Info badges */}
                <div className="flex flex-wrap gap-3 mt-2 pl-9">
                    <Badge
                        variant="outline"
                        className="text-sm h-6 font-medium border-primary/50 text-primary"
                    >
                        <Users className="w-4 h-4 mr-1" />
                        {topic.minMembers}-{topic.maxMembers} {t("members")}
                    </Badge>

                    <Badge
                        variant={isFull ? "destructive" : "secondary"}
                        className="text-sm h-6 font-medium"
                    >
                        {isFull && <AlertTriangle className="w-4 h-4 mr-1" />}
                        {groupCount}/{topic.maxGroupsPerTopic} {t("groups")}
                    </Badge>
                </div>
            </div>
        </div>
    );
};

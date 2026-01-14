import { CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentGroupResponse, AssignmentGroupStatus } from "@/types/assignmentGroup";
import { AssignmentGroupTopicResponse } from "@/types/assignmentGroupTopic";
import { BookOpen, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface GroupTopicHeaderProps {
  group: AssignmentGroupResponse | undefined;
  selectedTopic: AssignmentGroupTopicResponse | undefined;
  isGroupApproved: boolean;
}

export const GroupTopicHeader = ({
    group,
    selectedTopic,
    isGroupApproved,
}: GroupTopicHeaderProps) => {
    const t = useTranslations();

    const getStatusBadge = (status: AssignmentGroupStatus) => {
    const variants: Record<
      AssignmentGroupStatus,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      [AssignmentGroupStatus.PendingApproval]: "secondary",
      [AssignmentGroupStatus.Approved]: "default",
      [AssignmentGroupStatus.Rejected]: "destructive",
      [AssignmentGroupStatus.Draft]: "outline",
    };

    const statusKey = AssignmentGroupStatus[status].toLowerCase();
    return (
      <Badge variant={variants[status]}>
        {t(`assignment_group_status_${statusKey}`)}
      </Badge>
    );
  };

    return (
    <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {group ? (
              <>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("created_on", { date: new Date(group.createdAt).toLocaleDateString() })}
                  </p>
                  {isGroupApproved && selectedTopic && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{selectedTopic.title}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <CardTitle className="text-lg font-medium">
                {t("select_topic")}
              </CardTitle>
            )}
          </div>
          {group && getStatusBadge(group.status)}
        </div>
    </CardHeader>
    );
}
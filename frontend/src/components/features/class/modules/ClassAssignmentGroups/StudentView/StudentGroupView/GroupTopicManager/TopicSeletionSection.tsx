import { AssignmentGroupApprovalStatus, AssignmentGroupResponse, AssignmentGroupStatus } from "@/types/assignmentGroup";
import { AssignmentGroupTopicResponse } from "@/types/assignmentGroupTopic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, AlertTriangle } from "lucide-react"; 
import { useTranslations } from "next-intl";
import { SelectedTopicDisplay } from "./SeletedTopicDisplay";

interface TopicSeletionSectionProps {
  topics: AssignmentGroupTopicResponse[] | undefined;
  selectedTopicId: number | null;
  onTopicChange: (topicId: number) => void;
  group: AssignmentGroupResponse | undefined;
}

export const TopicSeletionSection = ({
  topics,
  selectedTopicId,
  onTopicChange,
  group,
}: TopicSeletionSectionProps) => {
  const t = useTranslations();
  const canSelectTopic = group?.status === AssignmentGroupStatus.Draft || group === undefined;

  const currentTopic = topics?.find(
      (topic) => topic.id === selectedTopicId
  );

  return (
    <div className="space-y-4">
        {canSelectTopic && (
            <div className="flex gap-4 items-start">
                <div className="flex-1">
                    <Select
                        value={selectedTopicId?.toString() ?? ""}
                        onValueChange={(value) => {
                          if (value) {
                            onTopicChange(Number(value));
                          }
                        }}
                    >
                        <SelectTrigger className="h-auto py-3">
                            <SelectValue placeholder={t("select_topic")} />
                        </SelectTrigger>
                        <SelectContent>
                            {topics?.map((topic) => {
                                const groupCount = topic.approvalRequests?.filter((request) => request.status !== AssignmentGroupApprovalStatus.Rejected)?.length || 0;
                                const isFull = groupCount >= topic.maxGroupsPerTopic;
                                const isMyTopic = group?.assignmentGroupTopicId === topic.id;

                                return (
                                    <SelectItem
                                        key={topic.id}
                                        value={topic.id.toString()}
                                        disabled={isFull && !isMyTopic} 
                                        className={`
                                            py-4 px-4 cursor-pointer rounded-lg mb-1 
                                            ${isMyTopic 
                                                ? "bg-primary/10 border-l-4 border-primary" 
                                                : "bg-background hover:bg-muted/50"} 
                                            ${isFull ? "opacity-70 text-muted-foreground" : ""}
                                            
                                            data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground
                                            data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed
                                            transition-all
                                        `}
                                    >
                                        <div className="flex flex-col items-start gap-2 text-left w-full">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-5 h-5 text-primary shrink-0" /> 
                                                    <span className="font-extrabold text-base line-clamp-1">{topic.title}</span> 
                                                </div>

                                                <div className="flex flex-wrap gap-2 shrink-0 ml-4">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs h-5 font-medium border-dashed"
                                                    >
                                                        <Users className="w-3 h-3 mr-1" />
                                                        {topic.minMembers}-{topic.maxMembers}{" "}
                                                        {t("members")}
                                                    </Badge>

                                                    <Badge
                                                        variant={isFull ? "destructive" : "secondary"} 
                                                        className="text-xs h-5 font-medium"
                                                    >
                                                        {isFull && <AlertTriangle className="w-3 h-3 mr-1" />}
                                                        {groupCount}/{topic.maxGroupsPerTopic}{" "}
                                                        {t("groups")}
                                                    </Badge>

                                                    {isMyTopic && (
                                                        <Badge
                                                            variant="default" 
                                                            className="text-xs h-5 px-2 font-medium"
                                                        >
                                                            {t("your_topic")}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {topic.description && (
                                                <span className="text-sm text-muted-foreground line-clamp-2 w-full pl-7 whitespace-pre-wrap">
                                                    {topic.description}
                                                </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        )}

        {!canSelectTopic && currentTopic && (
            <SelectedTopicDisplay topic={currentTopic} />
        )}
        
        {!canSelectTopic && !currentTopic && (
            <div className="p-5 border border-dashed rounded-xl text-center text-muted-foreground">
                <BookOpen className="w-6 h-6 mx-auto mb-2" />
                <p className="font-medium">{t("no_topic_assigned_yet")}</p>
                <p className="text-sm">{t("topic_will_be_displayed_here_once_assigned")}</p>
            </div>
        )}
    </div>
  );
};
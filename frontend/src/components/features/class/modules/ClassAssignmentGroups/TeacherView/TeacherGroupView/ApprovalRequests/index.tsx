"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users, BookOpen, CheckCircle, XCircle, Crown } from "lucide-react";
import { useGetApprovalRequests } from "@/queries/assignmentGroupQueries";
import { AssignmentGroupApprovalStatus } from "@/types/assignmentGroup";
import { AcceptRequestDialog } from "./AcceptRequestDialog";
import { RejectRequestDialog } from "./RejectRequestDialog";

interface ApprovalRequestsProps {
  assignmentId: number;
  classId: number;
}

export const ApprovalRequests = ({
  assignmentId,
  classId,
}: ApprovalRequestsProps) => {
  const t = useTranslations();
  const [acceptingRequest, setAcceptingRequest] = useState<{
    requestId: number;
    groupName: string;
  } | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<{
    requestId: number;
    groupName: string;
  } | null>(null);

  const { data: approvalRequests, isLoading } = useGetApprovalRequests(
    classId,
    assignmentId
  );

  // Filter for pending requests only
  const pendingRequests = approvalRequests?.filter(
    (req) => req.status === AssignmentGroupApprovalStatus.Pending
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("approval_requests")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !pendingRequests || pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("no_pending_requests")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => {
                const group = request.assignmentGroup;
                const topic = request.assignmentGroupTopic;

                return (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {/* Group info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Users className="w-4 h-4 text-primary shrink-0" />
                        <h4 className="font-semibold text-sm truncate">{group.name}</h4>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {group.groupMembers?.length || 0} {t("members")}
                        </Badge>
                        {topic && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <BookOpen className="w-3 h-3 shrink-0" />
                              <span className="truncate">{topic.title}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Members list with leader indicator */}
                      <div className="flex flex-wrap gap-2">
                        {group.groupMembers?.map((member) => {
                          const isLeader = member.isLeader;
                          return (
                            <div
                              key={member.id}
                              className={`flex items-center gap-2 rounded-md px-2.5 py-2 ${
                                isLeader ? "bg-primary/10 border border-primary/20" : "bg-muted"
                              }`}
                            >
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarImage src={member.member.avatarUrl || ""} />
                                <AvatarFallback className="text-xs">
                                  {member.member.userName?.[0] || member.member.userEmail[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-medium truncate max-w-36">
                                    {member.member.userName || member.member.userEmail}
                                  </span>
                                  {isLeader && (
                                    <Crown className="w-3.5 h-3.5 text-primary shrink-0" />
                                  )}
                                </div>
                                {member.member.userName && (
                                  <span className="text-xs text-muted-foreground truncate max-w-36">
                                    {member.member.userEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action buttons - icon only */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="default"
                        onClick={() =>
                          setAcceptingRequest({
                            requestId: request.id,
                            groupName: group.name,
                          })
                        }
                        className="h-9 w-9"
                        title={t("accept")}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() =>
                          setRejectingRequest({
                            requestId: request.id,
                            groupName: group.name,
                          })
                        }
                        className="h-9 w-9"
                        title={t("reject")}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {acceptingRequest && (
        <AcceptRequestDialog
          open={!!acceptingRequest}
          onOpenChange={(open: boolean) => !open && setAcceptingRequest(null)}
          approvalRequestId={acceptingRequest.requestId}
          groupName={acceptingRequest.groupName}
        />
      )}

      {rejectingRequest && (
        <RejectRequestDialog
          open={!!rejectingRequest}
          onOpenChange={(open: boolean) => !open && setRejectingRequest(null)}
          approvalRequestId={rejectingRequest.requestId}
          groupName={rejectingRequest.groupName}
        />
      )}
    </>
  );
};

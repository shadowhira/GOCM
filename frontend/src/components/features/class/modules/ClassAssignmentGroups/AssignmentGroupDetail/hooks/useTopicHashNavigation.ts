import { useEffect } from "react";
import type { AssignmentGroupTopicResponse } from "@/types/assignmentGroupTopic";

interface UseTopicHashNavigationProps {
  topics: AssignmentGroupTopicResponse[] | undefined;
  onOpenCreateTopic: () => void;
  onOpenEditTopic: (topic: AssignmentGroupTopicResponse) => void;
  onCloseTopic: () => void;
}

export function useTopicHashNavigation({
  topics,
  onOpenCreateTopic,
  onOpenEditTopic,
  onCloseTopic,
}: UseTopicHashNavigationProps) {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash === "#create") {
        onOpenCreateTopic();
      } else if (hash.startsWith("#edit-")) {
        const topicId = parseInt(hash.replace("#edit-", ""));
        if (!isNaN(topicId) && topics) {
          const topic = topics.find((t) => t.id === topicId);
          if (topic) {
            onOpenEditTopic(topic);
          }
        }
      } else if (!hash || hash === "#") {
        onCloseTopic();
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen to hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [topics, onOpenCreateTopic, onOpenEditTopic, onCloseTopic]);
}

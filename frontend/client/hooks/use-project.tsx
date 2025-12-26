import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { user, isLoaded } = useUser();
  const { data: projects, refetch: refetchProjects, isLoading, error } = api.project.getProjects.useQuery(
    undefined,
    {
      enabled: !!user && isLoaded,
    }
  );
  const [projectId, setProjectId] = useLocalStorage('dionysus-projectId', '');
  const project = projects?.find(project => project.id === projectId);
  
  return {
    projects,
    project,
    projectId,
    setProjectId,
    refetchProjects,
    isLoading,
    error,
  };
};

export default useProject;
import { useLocation } from "react-router-dom";
import ImportProjectForm from "./import-project-form";

export default function ImportProject() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const projectId = params.get("project");

  return (
    <div>
      <ImportProjectForm projectId={projectId} />
    </div>
  );
}

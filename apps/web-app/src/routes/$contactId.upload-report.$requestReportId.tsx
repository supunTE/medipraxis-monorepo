import { createFileRoute } from "@tanstack/react-router";
import { UploadReport } from "../pages/UploadReport";

export const Route = createFileRoute(
  "/$contactId/upload-report/$requestReportId"
)({
  component: () => {
    const { requestReportId } = Route.useParams();
    return <UploadReport requestReportId={requestReportId} />;
  },
});

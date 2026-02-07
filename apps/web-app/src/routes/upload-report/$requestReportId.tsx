import { UploadReport } from "@/routes/upload-report/UploadReport";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/upload-report/$requestReportId")({
  component: () => {
    const { requestReportId } = Route.useParams();
    return <UploadReport requestReportId={requestReportId} />;
  },
});

import { createApiClient } from "../../../packages/api-client/src";

const RPCTest = () => {
  // Initialize the API client - Sample code
  const api = createApiClient(import.meta.env.VITE_API_URL);

  const testApiCall = async () => {
    try {
      const res = await (api as any).api.tasks.$get();
      const data = await res.json();
      console.log("API Response:", data);
    } catch (error) {
      console.error("API Call Error:", error);
    }
  };

  const testCreateTaskApiCall = async () => {
    try {
      const res = await (api as any).api.tasks.$post({
        json: {
          task_title: "Make the log notes on the diabetic patient",
          task_type_id: "24f21ec7-bf59-4c35-9c54-36cb24afafbe",
          client_id: "24f21ec7-bf59-4c35-9c54-36cb24afafb3",
          user_id: "2a3c19b8-d352-4b30-a2ac-1cdf993d3102",
          start_date: "2025-12-20T06:46:42.023",
          end_date: "2025-12-25T05:32:21.756",
          note: "Patient needs to monitor blood sugar levels daily.",
          set_alarm: false,
          task_status_id: "24f21ec7-bf59-4c35-9c54-36cb24afafba",
        },
      });
      const data = await res.json();
      console.log("Create Task API Response:", data);
    } catch (error) {
      console.error("Create Task API Call Error:", error);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={testApiCall}>Get Tasks API Call Test</button>
        <button onClick={testCreateTaskApiCall}>
          Create Task API Call Test
        </button>
      </div>
    </>
  );
};

export default RPCTest;

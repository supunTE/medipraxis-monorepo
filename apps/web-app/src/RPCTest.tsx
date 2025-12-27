import { createApiClient } from "@repo/api-client";

const RPCTest = () => {
  // Initialize the API client
  const api = createApiClient(import.meta.env.VITE_API_URL).api;

  // Get All Tasks
  const testGetAllTasksApiCall = async () => {
    try {
      const res = await api.tasks.$get({
        query: {
          user_id: "2a3c19b8-d352-4b30-a2ac-1cdf993d3102",
        },
      });
      const data = await res.json();
      console.log("Get All Tasks API Response:", data);
    } catch (error) {
      console.error("Get All Tasks API Call Error:", error);
    }
  };

  // Get Task By ID
  const testGetTaskByIdApiCall = async () => {
    try {
      const taskId = "24f21ec7-bf59-4c35-9c54-36cb24afafbe"; // Replace with actual task ID

      const res = await api.tasks[":id"].$get({
        param: {
          id: taskId,
        },
      });
      const data = await res.json();
      console.log("Get Task By ID API Response:", data);
    } catch (error) {
      console.error("Get Task By ID API Call Error:", error);
    }
  };

  // Create Task
  const testCreateTaskApiCall = async () => {
    try {
      const res = await api.tasks.$post({
        json: {
          task_title: "Daily Blood Sugar Monitoring",
          user_id: "2a3c19b8-d352-4b30-a2ac-1cdf993d3102",
          task_type_id: "24f21ec7-bf59-4c35-9c54-36cb24afafbe",
          end_date: "2025-12-25T05:32:21.756",
          client_id: "24f21ec7-bf59-4c35-9c54-36cb24afafb3",
          start_date: "2025-12-20T06:46:42.023",
          note: "Patient needs to monitor blood sugar levels daily.",
          set_alarm: false,
          task_status_id: "24f21ec7-bf59-4c35-9c54-36cb24afafba",
          appointment_number: 1,
        },
      });
      const data = await res.json();
      console.log("Create Task API Response:", data);
    } catch (error) {
      console.error("Create Task API Call Error:", error);
    }
  };

  // Update Task (Full)
  const testUpdateTaskApiCall = async () => {
    try {
      const taskId = "24f21ec7-bf59-4c35-9c54-36cb24afafbe"; // Replace with actual task ID

      const res = await api.tasks[":id"].$put({
        param: {
          id: taskId,
        },
        json: {
          task_title: "Updated: Daily Blood Sugar Monitoring",
          task_type_id: "24f21ec7-bf59-4c35-9c54-36cb24afafbe",
          client_id: "24f21ec7-bf59-4c35-9c54-36cb24afafb3",
          start_date: "2025-12-20T06:46:42.023",
          end_date: "2025-12-26T05:32:21.756",
          note: "Updated: Patient needs to monitor blood sugar levels twice daily.",
          set_alarm: true,
          task_status_id: "24f21ec7-bf59-4c35-9c54-36cb24afafbb",
          user_id: "2a3c19b8-d352-4b30-a2ac-1cdf993d3102",
          appointment_number: 1,
        },
      });

      const data = await res.json();
      console.log("Update Task API Response:", data);
    } catch (error) {
      console.error("Update Task API Call Error:", error);
    }
  };

  // Update Task (Partial - only specific fields)
  const testPartialUpdateTaskApiCall = async () => {
    try {
      const taskId = "24f21ec7-bf59-4c35-9c54-36cb24afafbe"; // Replace with actual task ID

      const res = await api.tasks[":id"].$put({
        param: {
          id: taskId,
        },
        json: {
          task_title: "Partially Updated Task Title",
          appointment_number: 3,
          user_id: "2a3c19b8-d352-4b30-a2ac-1cdf993d3102",
          set_alarm: true,
        },
      });

      const data = await res.json();
      console.log("Partial Update Task API Response:", data);
    } catch (error) {
      console.error("Partial Update Task API Call Error:", error);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={testGetAllTasksApiCall}>Get All Tasks</button>
        <button onClick={testGetTaskByIdApiCall}>Get Task By ID</button>
        <button onClick={testCreateTaskApiCall}>Create Task</button>
        <button onClick={testUpdateTaskApiCall}>Update Task (Full)</button>
        <button onClick={testPartialUpdateTaskApiCall}>
          Update Task (Partial)
        </button>
      </div>
    </>
  );
};

export default RPCTest;

import { zValidator } from "@hono/zod-validator";
import {
  createClientSchema,
  deleteClientParamSchema,
  getAllClientsQuerySchema,
  getClientParamSchema,
  updateClientParamSchema,
  updateClientSchema,
} from "@repo/models";
import { Hono } from "hono";
import { ClientController } from "../controllers";

const clients = new Hono()
  .post(
    "/",
    zValidator("json", createClientSchema),
    ClientController.createClient
  )
  .get(
    "/",
    zValidator("query", getAllClientsQuerySchema),
    ClientController.getAllClients
  )
  .get(
    "/:id",
    zValidator("param", getClientParamSchema),
    ClientController.getClientById
  )
  .put(
    "/:id",
    zValidator("param", updateClientParamSchema),
    zValidator("json", updateClientSchema),
    ClientController.updateClient
  )
  .delete(
    "/:id",
    zValidator("param", deleteClientParamSchema),
    ClientController.deleteClient
  );

export default clients;

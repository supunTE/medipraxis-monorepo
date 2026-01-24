import { zValidator } from "@hono/zod-validator";
import {
  createClientWithContactSchema,
  deleteClientParamSchema,
  getAllClientsQuerySchema,
  getClientByPhoneQuerySchema,
  getClientParamSchema,
  updateClientParamSchema,
  updateClientSchema,
} from "@repo/models";
import { Hono } from "hono";
import { ClientController } from "../controllers";

const clients = new Hono()
  .post(
    "/",
    zValidator("json", createClientWithContactSchema),
    ClientController.createClient
  )
  .get(
    "/",
    zValidator("query", getAllClientsQuerySchema),
    ClientController.getAllClients
  )
  .get(
    "/check-phone",
    zValidator("query", getClientByPhoneQuerySchema),
    ClientController.getClientByPhone
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

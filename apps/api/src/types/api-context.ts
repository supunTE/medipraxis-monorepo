import { Context } from "hono";
import { Env } from "./env.type";

/**
 * Generic API Context type with support for all input types
 * @template I - Input types (json, form, query, param, etc.)
 * @template P - Path template (e.g., "/" or "/:id")
 */
export type APIContext<
  I extends Partial<{
    json: any;
    form: any;
    query: any;
    param: any;
    header: any;
    cookie: any;
  }> = {},
  P extends string = "/",
> = Context<
  {
    Bindings: Env;
  },
  P,
  {
    in: I;
    out: {
      json: any;
    };
  }
>;

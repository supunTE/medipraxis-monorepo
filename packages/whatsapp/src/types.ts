export type TemplateComponent =
  | {
      type: "body";
      parameters: { type: "text"; text: string }[];
    }
  | {
      type: "header";
      parameters: { type: "text"; text: string }[];
    };

export type TemplateMessagePayload = {
  name: string;
  language: {
    code: string;
  };
  components?: TemplateComponent[];
};

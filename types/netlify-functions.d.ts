declare module "@netlify/functions" {
  export interface HandlerEvent {
    httpMethod: string;
    body: string | null;
    queryStringParameters?: Record<string, string | undefined> | null;
  }

  export interface HandlerResponse {
    statusCode: number;
    headers?: Record<string, string>;
    body?: string;
  }

  export type Handler = (event: HandlerEvent) => Promise<HandlerResponse> | HandlerResponse;
}

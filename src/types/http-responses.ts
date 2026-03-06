export enum HTTP_RESPONSE_MESSAGE {
  SUCCESS = "Success",
  ERROR = "Error",
  BAD_REQUEST = "Bad Request",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",
  NOT_FOUND = "Not Found",
  METHOD_NOT_ALLOWED = "Method Not Allowed",
  CONFLICT = "Conflict",
  INTERNAL_SERVER_ERROR = "Internal Server Error",
}

export type HttpResponses<T> = {
  success: {
    message: HTTP_RESPONSE_MESSAGE;
    data: T;
    status: number;
  };
  error: {
    message: HTTP_RESPONSE_MESSAGE;
    status: number;
    errors: Record<string, string[]> | string;
  };
};

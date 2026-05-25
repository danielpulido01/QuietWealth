import { ApiError } from "../models/app-error";
import { errorHandler } from "../utils/error-handler";
import {
  handleUnauthorizedRequest,
  type UnauthorizedHandlingStrategy,
  type UnauthorizedRequestMeta,
} from "./unauthorizedHandlingStrategy";

type RequestMeta = UnauthorizedRequestMeta;

type InterceptorOptions = {
  handleUnauthorized?: boolean;
  unauthorizedStrategy?: UnauthorizedHandlingStrategy;
};

export function interceptHttpResponse(
  response: Response,
  request: RequestMeta,
  options: InterceptorOptions = {},
) {
  const shouldHandleUnauthorized = options.handleUnauthorized ?? true;

  if (response.status === 401 && shouldHandleUnauthorized) {
    handleUnauthorizedRequest(request, options.unauthorizedStrategy);
  }

  if (response.status === 403) {
    const error = new ApiError("Access denied for this operation.", {
      status: 403,
      context: {
        scope: "http-interceptors",
        request: {
          method: request.method,
          url: request.url,
          status: 403,
        },
      },
    });

    errorHandler.handle(error, {
      scope: "http-interceptors",
      request: {
        method: request.method,
        url: request.url,
        status: 403,
      },
      notifyUser: false,
    });
  }

  return response;
}

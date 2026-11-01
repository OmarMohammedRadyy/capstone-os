export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "BAD_REQUEST"
  | "INTERNAL_SERVER_ERROR"
  | "TASK_NOT_FOUND"
  | "PROJECT_NOT_FOUND"
  | "MILESTONE_NOT_FOUND"
  | "DOCUMENT_NOT_FOUND"
  | "FEEDBACK_NOT_FOUND"
  | "DECISION_NOT_FOUND"
  | "RISK_NOT_FOUND"
  | "ISSUE_NOT_FOUND"
  | "SUBMISSION_NOT_FOUND"
  | "SUBMISSION_LOCKED"
  | "SUBMISSION_REQUIREMENTS_INCOMPLETE"
  | "INVITE_INVALID"
  | "CYCLE_DEPENDENCY_DETECTED"
  | "INVALID_WEIGHTS"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "EDIT_CONFLICT";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode: number = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, code: ErrorCode = "BAD_REQUEST", details?: unknown) {
    return new AppError(code, message, 400, details);
  }

  static unauthorized(message = "Authentication required", code: ErrorCode = "UNAUTHORIZED") {
    return new AppError(code, message, 401);
  }

  static forbidden(message = "Permission denied", code: ErrorCode = "FORBIDDEN") {
    return new AppError(code, message, 403);
  }

  static notFound(message = "Resource not found", code: ErrorCode = "NOT_FOUND") {
    return new AppError(code, message, 404);
  }

  static conflict(message: string, code: ErrorCode = "CONFLICT", details?: unknown) {
    return new AppError(code, message, 409, details);
  }

  static validation(message: string, details?: unknown) {
    return new AppError("VALIDATION_ERROR", message, 422, details);
  }

  static rateLimited(message = "Too many requests. Please slow down.") {
    return new AppError("RATE_LIMITED", message, 429);
  }

  static internal(message = "An unexpected error occurred") {
    return new AppError("INTERNAL_SERVER_ERROR", message, 500);
  }
}

export function formatErrorResponse(error: unknown, requestId?: string) {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      meta: {
        requestId,
      },
    };
  }

  return {
    error: {
      code: "INTERNAL_SERVER_ERROR" as ErrorCode,
      message: "An internal server error occurred",
    },
    meta: {
      requestId,
    },
  };
}

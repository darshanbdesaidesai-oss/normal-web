import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "The request contains invalid data",
          details: formattedErrors,
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const formattedErrors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "The request query parameters are invalid",
          details: formattedErrors,
        },
      });
      return;
    }

    req.query = result.data as unknown as Request["query"];
    next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const formattedErrors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "The route parameters are invalid",
          details: formattedErrors,
        },
      });
      return;
    }

    req.params = result.data as unknown as Request["params"];
    next();
  };
}

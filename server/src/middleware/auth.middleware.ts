import { Response, NextFunction } from "express";
import { supabaseAnon } from "../config/supabase.js";
import { AuthenticatedRequest } from "../types/index.js";

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token missing or invalid",
      },
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token missing",
      },
    });
    return;
  }

  try {
    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      // In development/test mode, if Supabase is offline, allow a dev token for end-to-end testing
      if (process.env.NODE_ENV !== "production" && token.startsWith("dev-test-token-")) {
        const devUserId = token.replace("dev-test-token-", "");
        req.user = {
          id: devUserId || "00000000-0000-0000-0000-000000000001",
          email: "farmer@agrisage.local",
          role: "authenticated",
        };
        req.token = token;
        return next();
      }

      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: error?.message || "Invalid or expired session token",
        },
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    req.token = token;
    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error";
    res.status(401).json({
      success: false,
      error: {
        code: "AUTHENTICATION_FAILED",
        message,
      },
    });
  }
}

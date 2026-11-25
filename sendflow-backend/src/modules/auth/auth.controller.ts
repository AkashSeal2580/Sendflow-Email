
import { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.servece";

export async function register(req: Request, res: Response) {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    if (message === "Email already registered") {
      return res.status(409).json({
        success: false,
        message,
      });
    }

    console.error("Registration error:", error);

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";

    if (
      message === "Invalid email or password" ||
      message === "User not found"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

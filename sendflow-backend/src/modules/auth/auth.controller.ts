
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

    const status = message === "Email already registered" ? 409 : 400;

    return res.status(status).json({
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

    return res.status(401).json({
      success: false,
      message,
    });
  }
}

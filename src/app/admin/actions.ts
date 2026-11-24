"use server";

import { revalidatePath } from "next/cache";
import { checkPassword, endSession, isAdmin, isAdminConfigured, startSession } from "@/lib/auth";
import { setCampaignClosed, setEndText } from "@/lib/settings";

export type LoginState = { error?: "wrong" | "config" };

const FAILED_LOGIN_DELAY_MS = 1000;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) return { error: "config" };
  if (!checkPassword(String(formData.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, FAILED_LOGIN_DELAY_MS)); // slows down guessing
    return { error: "wrong" };
  }
  await startSession();
  revalidatePath("/admin");
  return {};
}

export async function logout(): Promise<void> {
  await endSession();
  revalidatePath("/admin");
}

async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

export async function toggleCampaign(formData: FormData): Promise<void> {
  await requireAdmin();
  await setCampaignClosed(formData.get("closed") === "true");
  revalidatePath("/admin");
}

export type EndTextState = { saved?: boolean };

export async function saveEndText(_prev: EndTextState, formData: FormData): Promise<EndTextState> {
  await requireAdmin();
  await setEndText(String(formData.get("endText") ?? ""));
  revalidatePath("/admin");
  return { saved: true };
}

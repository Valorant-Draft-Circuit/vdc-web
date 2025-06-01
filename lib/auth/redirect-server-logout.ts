"use server";

import { redirect } from "next/navigation";
import { signOut } from "./auth";

export async function signOutAndRedirect() {
  await signOut();
  redirect("/");
}

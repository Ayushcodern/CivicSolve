import { createFileRoute, Navigate } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminRedirectComponent,
});

function AdminRedirectComponent() {
  return <Navigate to="/dashboard/government" replace />;
}


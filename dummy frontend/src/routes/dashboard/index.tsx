import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndexPage,
});

function DashboardIndexPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    switch (role) {
      case "MODERATOR":
      case "ADMIN":
        navigate({ to: "/dashboard/moderator" });
        break;
      case "STUDENT":
      case "FACULTY":
      case "UNIVERSITY":
        navigate({ to: "/dashboard/university" });
        break;
      case "GOVT":
        navigate({ to: "/dashboard/government" });
        break;
      case "CITIZEN":
      default:
        navigate({ to: "/dashboard/citizen" });
        break;
    }
  }, [role, navigate]);

  return null;
}

export default DashboardIndexPage;

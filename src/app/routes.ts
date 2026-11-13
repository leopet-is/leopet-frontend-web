import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./RootLayout";
import { HomePage } from "./HomePage";
import { Catalog } from "./components/Catalog";
import { PetDetail } from "./components/PetDetail";

// Donor Pages (Code Split)
const ConfigurarManada = lazy(() => import("./pages/ConfigurarManada").then((m) => ({ default: m.ConfigurarManada })));
const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const DashboardEvidencias = lazy(() => import("./pages/DashboardEvidencias").then((m) => ({ default: m.DashboardEvidencias })));
const DashboardManada = lazy(() => import("./pages/DashboardManada").then((m) => ({ default: m.DashboardManada })));
const ManadasView = lazy(() => import("./components/ManadasView").then((m) => ({ default: m.ManadasView })));
const DashboardDenuncias = lazy(() => import("./pages/DashboardDenuncias").then((m) => ({ default: m.DashboardDenuncias })));
const FundacionesList = lazy(() => import("./components/FundacionesList").then((m) => ({ default: m.FundacionesList })));
const FundacionDetail = lazy(() => import("./components/FundacionDetail").then((m) => ({ default: m.FundacionDetail })));

// Admin Pages (Code Split)
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminSolicitudes = lazy(() => import("./pages/AdminSolicitudes").then((m) => ({ default: m.AdminSolicitudes })));
const AdminDenuncias = lazy(() => import("./pages/AdminDenuncias").then((m) => ({ default: m.AdminDenuncias })));
const AdminApelaciones = lazy(() => import("./pages/AdminApelaciones").then((m) => ({ default: m.AdminApelaciones })));
const AdminUsuarios = lazy(() => import("./pages/AdminUsuarios").then((m) => ({ default: m.AdminUsuarios })));

// Foundation Pages (Code Split)
const FoundationDashboard = lazy(() => import("./pages/FoundationDashboard").then((m) => ({ default: m.FoundationDashboard })));
const FoundationMascotas = lazy(() => import("./pages/FoundationMascotas").then((m) => ({ default: m.FoundationMascotas })));
const FoundationEvidencias = lazy(() => import("./pages/FoundationEvidencias").then((m) => ({ default: m.FoundationEvidencias })));
const FoundationPadrinos = lazy(() => import("./pages/FoundationPadrinos").then((m) => ({ default: m.FoundationPadrinos })));
const FoundationAdvertencias = lazy(() => import("./pages/FoundationAdvertencias").then((m) => ({ default: m.FoundationAdvertencias })));
const FoundationPagos = lazy(() => import("./pages/FoundationPagos").then((m) => ({ default: m.FoundationPagos })));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "mascotas",
        Component: Catalog,
      },
      {
        path: "mascota/:id",
        Component: PetDetail,
      },
      {
        path: "mi-manada/configurar",
        Component: ConfigurarManada,
      },
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "dashboard/evidencias",
        Component: DashboardEvidencias,
      },
      {
        path: "dashboard/manada",
        Component: DashboardManada,
      },
      {
        path: "dashboard/manadas",
        Component: ManadasView,
      },
      {
        path: "dashboard/denuncias",
        Component: DashboardDenuncias,
      },
      {
        path: "fundaciones",
        Component: FundacionesList,
      },
      {
        path: "fundaciones/:id",
        Component: FundacionDetail,
      },
      {
        path: "admin",
        Component: AdminDashboard,
      },
      {
        path: "admin/solicitudes",
        Component: AdminSolicitudes,
      },
      {
        path: "admin/denuncias",
        Component: AdminDenuncias,
      },
      {
        path: "admin/apelaciones",
        Component: AdminApelaciones,
      },
      {
        path: "admin/usuarios",
        Component: AdminUsuarios,
      },
      {
        path: "fundacion",
        Component: FoundationDashboard,
      },
      {
        path: "fundacion/mascotas",
        Component: FoundationMascotas,
      },
      {
        path: "fundacion/evidencias",
        Component: FoundationEvidencias,
      },
      {
        path: "fundacion/padrinos",
        Component: FoundationPadrinos,
      },
      {
        path: "fundacion/advertencias",
        Component: FoundationAdvertencias,
      },
      {
        path: "fundacion/pagos",
        Component: FoundationPagos,
      },
    ],
  },
]);

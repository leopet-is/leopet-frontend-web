import { createBrowserRouter } from "react-router";
import { RootLayout } from "./RootLayout";
import { HomePage } from "./HomePage";
import { Catalog } from "./components/Catalog";
import { PetDetail } from "./components/PetDetail";
import { ConfigurarManada } from "./pages/ConfigurarManada";
import { Dashboard } from "./pages/Dashboard";
import { DashboardEvidencias } from "./pages/DashboardEvidencias";
import { DashboardManada } from "./pages/DashboardManada";
import { DashboardDenuncias } from "./pages/DashboardDenuncias";
import { FundacionesList } from "./components/FundacionesList";
import { FundacionDetail } from "./components/FundacionDetail";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminSolicitudes } from "./pages/AdminSolicitudes";
import { AdminDenuncias } from "./pages/AdminDenuncias";
import { AdminApelaciones } from "./pages/AdminApelaciones";
import { FoundationDashboard } from "./pages/FoundationDashboard";
import { FoundationMascotas } from "./pages/FoundationMascotas";
import { FoundationEvidencias } from "./pages/FoundationEvidencias";
import { FoundationPadrinos } from "./pages/FoundationPadrinos";
import { FoundationAdvertencias } from "./pages/FoundationAdvertencias";
import { FoundationPagos } from "./pages/FoundationPagos";

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

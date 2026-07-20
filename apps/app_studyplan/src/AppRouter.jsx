import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
} from "react-router-dom";
import { NavigationHistoryLinks, NavigationHistoryProvider } from '../../../packages/_template/src/Base/Helpers/NavigationHistoryProvider';
import { BaseRouterSegments } from "../../../packages/_template/src/Base/Pages/RouterSegment";

import { StudyplanGQLModelRouterSegments } from "../../../packages/Study_Plan/src/StudyPlanGQLModel/Pages/RouterSegment";

// Společný layout pro všechny stránky appky: pod historií navigace (tlačítko
// zpět/breadcrumby) je `Outlet`, kam react-router vloží obsah aktuálně
// otevřené route (viz `children` v `Routes` níže)
const AppLayout = () => (
    <NavigationHistoryProvider>
        <NavigationHistoryLinks />
        <Outlet />
    </NavigationHistoryProvider>
);

// Definice všech tras aplikace.
const Routes = [
    {
        path: "/",
        element: <AppLayout />,
        children: [
            ...StudyplanGQLModelRouterSegments,
            ...BaseRouterSegments,
        ],
    },
];

const router = createBrowserRouter(Routes);

// Kořenová komponenta appky — vloží se do main.jsx a spustí celé routování
export const AppRouter = () => <RouterProvider router={router} />;

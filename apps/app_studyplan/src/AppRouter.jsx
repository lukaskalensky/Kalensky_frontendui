import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
} from "react-router-dom";
import { NavigationHistoryLinks, NavigationHistoryProvider } from '../../../packages/_template/src/Base/Helpers/NavigationHistoryProvider';
import { BaseRouterSegments } from "../../../packages/_template/src/Base/Pages/RouterSegment";

import { AppNavbar } from "./AppNavbar";
import { StudyplanGQLModelRouterSegments } from "../../../packages/Study_Plan/src/StudyPlanGQLModel/Pages/RouterSegment";
import { ProgramGQLModelRouterSegments } from "../../../packages/granting2/src/ProgramGQLModel/Pages/RouterSegment";
import { StudentGQLModelRouterSegments } from "../../../packages/granting2/src/StudentGQLModel/Pages/RouterSegment";
import { SemesterGQLModelRouterSegments } from "../../../packages/granting2/src/SemesterGQLModel/Pages/RouterSegment";
import { TopicGQLModelRouterSegments } from "../../../packages/granting2/src/TopicGQLModel/Pages/RouterSegment";
import { StudyPlanGQLModelRouterSegments } from "../../../packages/granting2/src/StudyPlanGQLModel/Pages/RouterSegment";

// Společný layout pro všechny stránky appky: navigační lišta nahoře, pod ní historie
// navigace (tlačítko zpět/breadcrumby) a `Outlet` je místo, kam react-router vloží
// obsah aktuálně otevřené route (viz `children` v `Routes` níže)
const AppLayout = () => (
    <NavigationHistoryProvider>
        <AppNavbar />
        <NavigationHistoryLinks />
        <Outlet />
    </NavigationHistoryProvider>
);

// Definice všech tras aplikace. `StudyplanGQLModelRouterSegments` (naše vlastní
// route segmenty pro balíček Study_Plan, viz Pages/RouterSegment.jsx) jsou
// záměrně první v poli, aby v případě shodné cesty s obecnými segmenty z
// granting2 (StudyPlanGQLModelRouterSegments) měly přednost naše vlastní stránky.
const Routes = [
    {
        path: "/",
        element: <AppLayout />,
        children: [
            ...StudyplanGQLModelRouterSegments,
            ...ProgramGQLModelRouterSegments,
            ...StudentGQLModelRouterSegments,
            ...SemesterGQLModelRouterSegments,
            ...TopicGQLModelRouterSegments,
            ...StudyPlanGQLModelRouterSegments,
            ...BaseRouterSegments,
        ],
    },
];

const router = createBrowserRouter(Routes);

// Kořenová komponenta appky — vloží se do main.jsx a spustí celé routování
export const AppRouter = () => <RouterProvider router={router} />;

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

const AppLayout = () => (
    <NavigationHistoryProvider>
        <AppNavbar />
        <NavigationHistoryLinks />
        <Outlet />
    </NavigationHistoryProvider>
);

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

export const AppRouter = () => <RouterProvider router={router} />;

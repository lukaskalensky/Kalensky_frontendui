import {
      createBrowserRouter,
      RouterProvider
} from "react-router-dom";

// import { BaseUI } from "../../../packages/_template/src/Base";
import { BaseRouterSegments } from "../../../packages/_template/src/Base/Pages/RouterSegment";
// import { TemplateRouterSegments } from "../../../packages/_template/src/_Template/Pages/RouterSegment";
import { UserRouterSegments } from "../../../packages/_template/src/UserGQLModel/Pages/RouterSegment";
import { GroupRouterSegments } from "../../../packages/_template/src/GroupGQLModel2/Pages/RouterSegment";
import { RoleRouterSegments } from "../../../packages/_template/src/RoleGQLModel2/Pages/RouterSegment";
// import { TemplateRouterSegments } from "../../../packages/_template/src/Template";

const Routes = [
    // UserRouterSegment
    ...BaseRouterSegments,
    // {
    //     path: "/typename/:typename/view/:id",
    //     element: <BaseUI.Page />
    // },
    // ...TemplateRouterSegments,
    ...UserRouterSegments,
    ...GroupRouterSegments,
    ...RoleRouterSegments

]
const router = createBrowserRouter(Routes);

export const AppRouter = () => <RouterProvider router={router} />
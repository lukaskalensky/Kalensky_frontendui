import { NavDropdown } from "react-bootstrap"
import { ProxyLink } from "../../../packages/_template/src/Base/Components/ProxyLink"
import { PageNavbar } from "../../../packages/_template/src/Base/Pages/PageNavbar"

const ProgramyDropdown = () => (
    <NavDropdown title="Programy">
        <NavDropdown.Item as={ProxyLink} to="/granting/ProgramGQLModel/list/">
            Seznam programů
        </NavDropdown.Item>
        <NavDropdown.Item as={ProxyLink} to="/granting/ProgramGQLModel/create/">
            Nový program
        </NavDropdown.Item>
    </NavDropdown>
)

const StudentiDropdown = () => (
    <NavDropdown title="Studenti">
        <NavDropdown.Item as={ProxyLink} to="/granting/StudentGQLModel/list/">
            Seznam studentů
        </NavDropdown.Item>
        <NavDropdown.Item as={ProxyLink} to="/granting/StudentGQLModel/create/">
            Nový student
        </NavDropdown.Item>
    </NavDropdown>
)

const PozadavkyDropdown = () => (
    <NavDropdown title="Požadavky">
        <NavDropdown.Item as={ProxyLink} to="/granting/StudyPlanGQLModel/list/">
            Studijní plány
        </NavDropdown.Item>
        <NavDropdown.Item as={ProxyLink} to="/granting/SemesterGQLModel/list/">
            Semestry
        </NavDropdown.Item>
        <NavDropdown.Item as={ProxyLink} to="/granting/TopicGQLModel/list/">
            Témata
        </NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item as={ProxyLink} to="/studyplan/StudyPlanGQLModel/list/">
            Moje studijní plány
        </NavDropdown.Item>
    </NavDropdown>
)

export const AppNavbar = () => {
    return (
        <PageNavbar>
            <ProgramyDropdown />
            <StudentiDropdown />
            <PozadavkyDropdown />
        </PageNavbar>
    )
}

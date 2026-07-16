import { NavDropdown } from "react-bootstrap"
import { ProxyLink } from "../../../packages/_template/src/Base/Components/ProxyLink"
import { PageNavbar } from "../../../packages/_template/src/Base/Pages/PageNavbar"

// Rozbalovací nabídka "Programy" v horní liště — odkazy na obecné (napříč všemi
// aplikacemi sdílené) stránky správy studijních programů z packages/granting2
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

// Rozbalovací nabídka "Studenti" — odkazy na seznam studentů a založení nového
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

// Rozbalovací nabídka "Požadavky" s odkazy na studijní plány, semestry a témata.
// Obsahuje ODDĚLENĚ dvě sady odkazů na stejný typ entity (StudyPlanGQLModel):
// jednu vedoucí na obecnou "/granting/..." cestu (sdílený generický seznam z
// granting2) a jednu na "/studyplan/..." (naši vlastní verzi téhle stránky v
// tomto standalone appku, se všemi úpravami popsanými výše ve StudyPlanDetail.jsx).
// Oddělovač (Divider) je tam schválně, aby bylo v menu vidět, že jde o dvě různé věci.
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

// Horní navigační lišta téhle standalone aplikace (app_studyplan) — skládá dohromady
// tři rozbalovací nabídky výše a vkládá je do sdílené šablonové PageNavbar
export const AppNavbar = () => {
    return (
        <PageNavbar>
            <ProgramyDropdown />
            <StudentiDropdown />
            <PozadavkyDropdown />
        </PageNavbar>
    )
}

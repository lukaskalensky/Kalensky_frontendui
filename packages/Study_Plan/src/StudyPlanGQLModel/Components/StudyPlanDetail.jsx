import { Attribute, formatDateTime } from "../../../../_template/src"
import { Col } from "../../../../_template/src/Base/Components/Col"
import { Row } from "../../../../_template/src/Base/Components/Row"
import { Link } from "./Link"

export const StudyPlanDetail = ({ item, children }) => {
    return (
        <div>
            <Row>
                <Col className="col-lg-3">
                    <div className="card shadow-sm border-0 p-3 mb-4">
                        <h6 className="fw-bold border-bottom pb-2 mb-3">Základní informace</h6>
                        
                        <Attribute label="id">
                            <Link item={item} />
                        </Attribute>

                        <Attribute label="Vytvořil">
                            <Link item={item?.createdby}>
                                {item?.createdby?.fullname || 'Neznámý'}
                            </Link>
                        </Attribute>

                        <Attribute label="Email">
                            <a href={`mailto:${item?.createdby?.email}`} className="text-decoration-none">
                                {item?.createdby?.email || '—'}
                            </a>
                        </Attribute>

                        <Attribute label="Vytvořeno">
                            <span className="small">
                                {formatDateTime(item?.created)} {" "} {item?.createdby?.fullname}
                            </span>
                        </Attribute>

                        <Attribute label="Poslední změna">
                            <span className="small">
                                {formatDateTime(item?.lastchange)} {" "} {item?.changedby?.fullname}
                            </span>
                        </Attribute>

                        <Attribute label="Semestr ID">
                            <Link item={item?.semester}>
                                {item?.semester?.id || 'Zobrazit'}. semestr
                            </Link>
                        </Attribute>
                        <Attribute label="Předmět ID">
                        <Link item={item?.semester}>
                            {item?.semester?.subjectId}
                        </Link>
                        </Attribute>
                    </div>

                </Col>
                <Col className="col-lg-9">
                    {children}
                </Col>
            </Row>
        </div>
    )
}
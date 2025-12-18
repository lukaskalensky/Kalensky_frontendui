import { Col } from "./Col";
import { Row } from "./Row";
import { MediumCard } from "./MediumCard";

export const LargeCard = ({ item, children }) => {
    return (
        <Row>
            <Col className="col-4">
                <MediumCard item={item} />
            </Col>
            <Col className="col-8">
                {children}
            </Col>
        </Row>
    );
}
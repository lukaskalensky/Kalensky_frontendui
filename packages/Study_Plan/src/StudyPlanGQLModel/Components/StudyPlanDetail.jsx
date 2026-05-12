import { formatDateTime } from "../../../../_template/src"
import { Link } from "./Link"
import { ProxyLink } from "../../../../_template/src/Base/Components/ProxyLink"
import { CreateURI } from "./Link"

const InfoRow = ({ label, children }) => (
    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "4px", marginBottom: "10px", alignItems: "start" }}>
        <span style={{ fontWeight: "600", color: "#333" }}>{label}</span>
        <span>{children}</span>
    </div>
)

const TopicRow = ({ topic, lessons, planId }) => {
    const lessonsByType = (lessons || []).reduce((acc, l) => {
        const typeName = l.lessontype?.name || l.lessontype?.nameEn || null;
        if (!typeName) return acc;
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
    }, {});
    const typeEntries = Object.entries(lessonsByType);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 24px",
                borderBottom: "1px solid #d08888",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <ProxyLink
                    to={`/granting/TopicGQLModel/view/${topic.id}`}
                    style={{ fontWeight: 500 }}
                >
                    {topic.name || topic.nameEn || `Téma ${topic.order ?? ""}`}
                </ProxyLink>
                {typeEntries.map(([type, count]) => (
                    <span key={type} style={{ color: "#555", fontSize: "0.9rem" }}>
                        {count} x{" "}
                        <ProxyLink to={`/granting/TopicGQLModel/view/${topic.id}`} style={{ color: "#555" }}>
                            {type}
                        </ProxyLink>
                    </span>
                ))}
            </div>
            <ProxyLink
                to={`${CreateURI}?topicId=${topic.id}&planId=${planId || ""}`}
                style={{
                    minWidth: "500px",
                    textAlign: "center",
                    padding: "8px 20px",
                    border: "1px solid #aaa",
                    borderRadius: "4px",
                    background: "#fff",
                    color: "#333",
                    textDecoration: "none",
                    display: "inline-block",
                }}
            >
                Přidat výuku
            </ProxyLink>
        </div>
    )
}

export const StudyPlanDetail = ({ item, children }) => {
    const semester = item?.semester
    const subjectName = semester?.subject?.name || semester?.subject?.nameEn || null
    const semesterOrder = semester?.order ?? null
    const examName = item?.exam?.name || null

    const topics = semester?.topics || []
    const lessons = item?.lessons || []
    const lessonsByTopic = lessons.reduce((acc, l) => {
        const tid = l.topicId;
        if (!acc[tid]) acc[tid] = [];
        acc[tid].push(l);
        return acc;
    }, {});
    const sortedTopics = [...topics]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .filter(t => (lessonsByTopic[t.id] || []).length > 0);

    return (
        <div style={{ minHeight: "100vh" }}>

            {/* ── top section: info panel (left) + entity lookups (right) ── */}
            <div style={{ background: "#fff", padding: "12px 0" }}>
                <div style={{ display: "flex", alignItems: "flex-start" }}>

                    {/* LEFT: study plan info */}
                    <div style={{
                        width: "280px",
                        flexShrink: 0,
                        padding: "12px 16px",
                        margin: "10px 16px",
                        background: "#fff",
                        border: "1px solid #b8d0bb",
                        borderRadius: "6px",
                    }}>
                        <div style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                            <span style={{ fontSize: "1rem", lineHeight: 1.4 }}>👤</span>
                            <Link item={item}>
                                <span style={{ wordBreak: "break-all", fontSize: "0.85rem" }}>
                                    {item?.id?.toUpperCase()}
                                </span>
                            </Link>
                        </div>

                        <InfoRow label="Semestr">
                            <Link item={semester}>
                                {subjectName && semesterOrder
                                    ? <>{subjectName} / {semesterOrder}</>
                                    : <span style={{ color: "#888", fontStyle: "italic" }}>Missing</span>
                                }
                            </Link>
                        </InfoRow>

                        <InfoRow label="Období">
                            <Link item={semester}>
                                <span style={{ color: "#888", fontStyle: "italic" }}>Missing</span>
                            </Link>
                        </InfoRow>

                        <div style={{ color: "#888", marginBottom: "10px", marginLeft: "94px" }}>- -</div>

                        <InfoRow label="Zkouška">
                            {examName
                                ? <Link item={item?.exam}>{examName}</Link>
                                : <Link item={item?.exam}>
                                    <span style={{ color: "#888", fontStyle: "italic" }}>Missing</span>
                                </Link>
                            }
                        </InfoRow>

                        {/* Vytvořeno / Změněno – ohraničená sekce */}
                        <div style={{
                            marginTop: "10px",
                            padding: "8px 10px",
                            border: "1px solid #b8d0bb",
                            borderRadius: "5px",
                            background: "#f7fbf8",
                        }}>
                            <InfoRow label="Vytvořeno">
                                <span style={{ fontSize: "0.85rem" }}>
                                    <Link item={item?.createdby}>
                                        {item?.createdby?.fullname || "—"}
                                    </Link>
                                    {item?.created && <> @ {formatDateTime(item.created)}</>}
                                </span>
                            </InfoRow>

                            <InfoRow label="Změněno">
                                <span style={{ fontSize: "0.85rem" }}>
                                    <Link item={item?.changedby}>
                                        {item?.changedby?.fullname || "—"}
                                    </Link>
                                    {item?.lastchange && <> @ {formatDateTime(item.lastchange)}</>}
                                </span>
                            </InfoRow>
                        </div>
                    </div>

                    {/* divider */}
                    <div style={{ width: "1px", alignSelf: "stretch", background: "#a8c8b0", margin: "8px 0", flexShrink: 0 }} />

                    {/* RIGHT: entity lookups (children = MyCustomWidget) */}
                    <div style={{ flex: 1, padding: "8px 24px", background: "#fff" }}>
                        {children}
                    </div>
                </div>
            </div>

            {/* ── bottom section: topics full width ── */}
            <div style={{ background: "#e8b4b8", paddingTop: "4px" }}>
                {sortedTopics.length === 0 ? (
                    <div style={{ padding: "24px", color: "#666", fontStyle: "italic" }}>
                        Žádná témata nebyla nalezena.
                    </div>
                ) : (
                    sortedTopics.map((topic) => (
                        <TopicRow
                            key={topic.id}
                            topic={topic}
                            lessons={lessonsByTopic[topic.id] || []}
                            planId={item?.id}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

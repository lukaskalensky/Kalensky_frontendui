import React from 'react';
import { MyForm } from './MujEntitylookup';
const formatLessonTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${dayName} ${day}.${month}. ${hours}:${minutes}`;
};
// --- HLAVNÍ KOMPONENTA ---
export const MyCustomWidget = ({ item, children }) => {
  // Ochrana pro případ, že item ještě není načtený
  if (!item) return <div className="alert alert-info">Načítání studijního plánu...</div>;

  // Destrukturalizace dat z itemu pro čistší kód níže
  const {
    id,
    createdby,
    semester,
    exam,
    created,
    lastchange,
    lessons = []
  } = item;

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      
      {/* HLAVIČKA CELÉ STRÁNKY */}
      <div className="mb-4">
        <h2 className="fw-bold text-uppercase mb-1" style={{ letterSpacing: '1px' }}>Detail studijního plánu</h2>
        <MyForm/>
        <div className="text-muted small">
          ID: '{id}' <span className="font-monospace">({id?.slice(0, 8)}...)</span>
        </div>
      </div>

        {/* PRAVÝ PANEL (Seznam lekcí) */}
        <div className="col-12 mt-4">
  <div className="card shadow-sm border-0 rounded-3 bg-white h-100">
    <div className="card-header bg-white pt-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
      <h5 className="fw-bold mb-0">Tabulka lekcí</h5>
      <button className="btn btn-sm btn-primary rounded-pill">
        <i className="bi bi-plus-lg me-1"></i> Přidat lekci
      </button>
    </div>
    
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light text-dark">
          <tr className="small">
            <th className="px-4 py-3">#</th>
            <th>
              Téma / Lekce <br/>
              <span className="text-muted fw-normal">(StudyPlanLessonGQLModel)</span>
            </th>
            <th>
              Kdy <br/>
              <span className="text-muted fw-normal">(Čas)</span>
            </th>
            <th>
              Vyučující <br/>
              <span className="text-muted fw-normal">(Kdo - UserGQLModel)</span>
            </th>
            <th>
              Skupina <br/>
              <span className="text-muted fw-normal">(Koho - Group)</span>
            </th>
            <th>
              Místnost <br/>
              <span className="text-muted fw-normal">(Kde - Facility)</span>
            </th>
            <th>
              Vazba na zkoušku <br/>
              <span className="text-muted fw-normal">(ExamGQLModel)</span>
            </th>
            <th className="text-end px-4">Akce</th>
          </tr>
        </thead>
        <tbody>
          {item?.lessons && item.lessons.length > 0 ? (
            [...item.lessons]
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((lesson) => {
                // Bezpečné složení stringů, pokud data existují
                const instructors = lesson.instructors?.length > 0 
                  ? lesson.instructors.map(i => i.fullname || i.name).join(', ') 
                  : '-';
                const groups = lesson.studyGroups?.length > 0 
                  ? lesson.studyGroups.map(g => g.name).join(', ') 
                  : '-';
                const facilities = lesson.facilities?.length > 0 
                  ? lesson.facilities.map(f => f.name).join(', ') 
                  : '-';
                
                // Příklad, jak vyřešit vazbu na zkoušku (pokud ji lesson má)
                const examBadge = lesson.exam ? (
                  <span className="badge bg-secondary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.75rem' }}>
                    <i className="bi bi-file-earmark-text me-1"></i>
                    {lesson.exam.name.toUpperCase()}
                  </span>
                ) : '-';

                return (
                  <tr key={lesson.id} className="border-bottom">
                    <td className="px-4 fw-bold">{lesson.order}</td>
                    <td className="fw-medium text-dark">{lesson.name}</td>
                    <td className="text-nowrap">{formatLessonTime(lesson.event?.startdate)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span>{instructors}</span>
                      </div>
                    </td>
                    <td>{groups}</td>
                    <td>{facilities}</td>
                    <td>{examBadge}</td>
                    <td className="text-end px-4 text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary me-2" title="Upravit">
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" title="Smazat">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                )
              })
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-5 text-muted fst-italic">
                Žádné lekce nebyly nalezeny.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
      </div>
  )
};
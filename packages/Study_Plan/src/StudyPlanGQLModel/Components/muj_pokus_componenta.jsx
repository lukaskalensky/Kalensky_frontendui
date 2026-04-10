// muj_pokus_componenta.jsx
import React from 'react';

export const MyCustomWidget = (props) => {
  // 1. Ochrana: Dokud data z GraphQL nedorazí, props.item může být undefined/null.
  // Vykreslíme zatím "Načítání..."
  if (!props.item) {
      return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
              Načítám data ze serveru...
          </div>
      );
  }

  // 2. Data jsou tady! Můžeme je bezpečně použít.
  return (
    <div style={{ border: '2px solid blue', padding: '10px', backgroundColor: "white" }}>
      <h2>Moje vlastní komponenta</h2>
      
      {/* Vypíšeme to, co jsme definovali v MujPokusQueryStr */}
      <ul>
          <li><strong>ID z databáze:</strong> {props.item.id}</li>
          <li><strong>Typ entity:</strong> {props.item.__typename}</li>
          <li><strong>Predmet:</strong> {props.item.subject.name}</li>
      </ul>
      
    </div>
  );
};
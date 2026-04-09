// muj_pokus_componenta.jsx
import React from 'react';

// POZOR: Přijímáme props. V nich bude od PageItemBase schovaný ten načtený 'item'
export const MyCustomWidget = (props) => {
  return (
    <div style={{ border: '2px solid blue', padding: '10px' }}>
      <h2>Moje vlastní komponenta</h2>
    </div>
  );
};
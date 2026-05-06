// MyForm.jsx
import React, { useState } from "react";
import { SearchAsyncAction } from "../Queries/SearchAsyncAction";
import { EntityLookup } from "../../../../_template/src";

export const MyForm = () => {
    // Stav uchovává CELÝ objekt vybrané entity (např. {id: "123", name: "Jan Novák"})
    const [selectedUser, setSelectedUser] = useState(null);

    // Funkce, která se zavolá, když uživatel klikne na výsledek v našeptávači
    const handleSelect = (user) => {
        setSelectedUser(user); // Uložíme vybraného uživatele do stavu
        return { clear: true }; // { clear: true } zajistí, že se seznam výsledků po kliknutí zavře
    };

    return (
        <div className="p-3">
            <h3>Vyberte uživatele</h3>
            
            <EntityLookup 
                id="userInputId" // Libovolné ID pro interní potřeby (např. pro simulovaný onChange event)
                label="Hledat uživatele:"
                asyncAction={SearchAsyncAction} // Předáme připravenou akci z kroku 1
                value={selectedUser} // Předáváme aktuálně vybraný objekt (nebo null)
                onSelect={handleSelect} // Reakce na výběr
                placeholder="Napište alespoň 3 znaky..." // Další props se předají přímo do vnitřního HTML inputu
            />

            {/* Zobrazení vybraných dat pro kontrolu */}
            <div className="mt-4">
                <p><strong>Vybrané ID:</strong> {selectedUser ? selectedUser.id : "Zatím nic"}</p>
                <p><strong>Zobrazené jméno:</strong> {selectedUser ? (selectedUser.fullname || selectedUser.name) : "Zatím nic"}</p>
            </div>
        </div>
    );
};
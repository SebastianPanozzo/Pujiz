import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null; // Recuperar usuario del localStorage
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user)); // Guardar usuario en localStorage
        } else {
            localStorage.removeItem('user'); // Eliminar usuario de localStorage
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);


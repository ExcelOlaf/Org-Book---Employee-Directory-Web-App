import React, { useState, useEffect, use } from 'react';
import { getDepartments, getEmployees } from "../api";


export default function DepartmentLookup() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getDepartments();
                setDepartments(data);
            } catch (error) {
                console.error("Failed to fetch departments:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <p>loading...</p>

    return (
        <div style = {{ padding: "40px" }}>
            <h1>Department Lookup</h1>
            <ul>
                {departments.map((dept) => (
                    <li key={dept.id}>{dept.name}</li>
                ))}
            </ul>
        </div>
    );
}
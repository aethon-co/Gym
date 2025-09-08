"use client"

import { useParams } from 'next/navigation';

export default function StudentIdPage() {
    const params = useParams();
    const { id } = params;

    return (
        <div>
            <h1>Student ID: {id}</h1>
        </div>
    );
}
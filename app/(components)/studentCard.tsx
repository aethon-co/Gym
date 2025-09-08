import StatusDot from "./statusDot"

const StudentCard = ({ name, membershipType, status }: { name: string, membershipType: string, status: 'Active' | 'Expired' | 'Suspended' }) => {
    return (
        <div className="rounded-2xl border min-w-[26vw] max-w-[26vw] h-[20vh]">
            {name}
            {membershipType}
            {status}
            <StatusDot status={status} />
        </div>
    )
}

export default StudentCard
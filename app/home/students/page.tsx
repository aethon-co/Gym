import StudentCard from "@/app/(components)/studentCard"

const Students = () => {
    return (
        <div>
            Students
            <div className='flex max-w-[85vw] flex-wrap gap-10'>
                <StudentCard name="S1" membershipType='Basic' status='Active' />
                <StudentCard name="S2" membershipType='Premium' status='Active' />
                <StudentCard name="S3" membershipType='Student' status='Active' />
                <StudentCard name="S4" membershipType='Basic' status='Expired' />
                <StudentCard name="S1" membershipType='Basic' status='Suspended' />
            </div>
        </div>
    )
}

export default Students
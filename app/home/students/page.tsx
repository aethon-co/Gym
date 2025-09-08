import StudentCard from "@/app/(components)/studentCard"

const Students = () => {
    return (
        <div>
            Students
            <div className='flex max-w-[85vw] flex-wrap gap-10'>
                <StudentCard name="S1" membershipType='Basic' status='Active' subscriptionEndDate={20} />
                <StudentCard name="S2" membershipType='Premium' status='Active' subscriptionEndDate={20} />
                <StudentCard name="S3" membershipType='Student' status='Active' subscriptionEndDate={10} />
                <StudentCard name="S4" membershipType='Basic' status='Expired' subscriptionEndDate={5} />
                <StudentCard name="S1" membershipType='Basic' status='Suspended' subscriptionEndDate={10} />
            </div>
        </div>
    )
}

export default Students
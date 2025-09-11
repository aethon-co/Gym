"use client"

import StudentCard from "@/app/(components)/studentCard"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

const Students = () => {

    const [search, setSearch] = useState("")
    return (
        <div>
            Students

            <Input className="rounded-full w-[60%]" type="text" value={search} placeholder="Search" onChange={(e) => setSearch(e.target.value)} />
            <br />
            <div className='flex max-w-[85vw] flex-wrap gap-10'>
                <StudentCard key={"1"} id={"1"} name="S1" membershipType='Basic' status='Active' subscriptionEndDate={20} />
                <StudentCard key={"2"} id={"2"} name="S2" membershipType='Premium' status='Active' subscriptionEndDate={20} />
                <StudentCard key={"3"} id={"3"} name="S3" membershipType='Student' status='Active' subscriptionEndDate={10} />
                <StudentCard key={"4"} id={"4"} name="S4" membershipType='Basic' status='Expired' subscriptionEndDate={5} />
                <StudentCard key={"5"} id={"5"} name="S1" membershipType='Basic' status='Suspended' subscriptionEndDate={10} />
            </div>
        </div>
    )
}

export default Students
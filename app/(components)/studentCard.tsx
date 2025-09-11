import Link from "next/link"
import StatusDot from "./statusDot"

const StudentCard = ({ name, membershipType, status, subscriptionEndDate, id }: { id: string, name: string, membershipType: string, status: 'Active' | 'Expired' | 'Suspended', subscriptionEndDate: Number }) => {
    return (
        <Link href={`./students/${id}`}>
            <div className="flex justify-around rounded-2xl border min-w-[26vw] max-w-[26vw] h-[20vh]">
                <div className="flex flex-col justify-center w-[60%] gap-3">
                    <h1 className="font-bold text-xl">{name}</h1>
                    <p>{membershipType}</p>
                    <p>{`Ends in ${subscriptionEndDate} Days`}</p>
                </div>
                <div className="">
                    <br />
                    {status}<span>  </span>
                    <StatusDot status={status} />
                </div>
            </div>
        </Link>
    )
}

export default StudentCard
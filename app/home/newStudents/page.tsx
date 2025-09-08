import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const RegisterStudent = () => {
    return (
        <div>
            <h1 className="uppercase text-2xl font-bold mb-8 ">Register New Student</h1>
            <div className="flex flex-col gap-5 w-[60vw]">
                <Input type="text" placeholder="Name" />
                <Input type="text" placeholder="Age" />
                <Input type="text" placeholder="Phone Number" />

                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                </Select>

                <Calendar />

                <Button className="w-[15vw]">Create</Button>
            </div>
        </div>
    )
}

export default RegisterStudent
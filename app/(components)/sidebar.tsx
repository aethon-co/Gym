import Link from 'next/link';

const Sidebar = () => {
    return (
        <div className="border h-full w-[12vw]">
            <div className="flex flex-col items-center space-y-4 mt-4">
                <Link href="./students" className="cursor-pointer hover:text-blue-500">
                    Students
                </Link>

                <Link href="./attendance" className="cursor-pointer hover:text-blue-500">
                    Attendance
                </Link>

                <Link href="./newStudents" className="cursor-pointer hover:text-blue-500">
                    Register Students
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;

"use client"

import StatusDot from '@/app/(components)/statusDot';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function StudentIdPage() {
    const params = useParams();
    const { id } = params;

    return (
        <div className='w-[100%] h-[90vh] flex'>
            <div className='w-[80%] h-[100%]'>
                <div className='text-center mt-20'>
                    <h1 className='text-4xl font-bold mb-2'>THE PERSON'S NAME</h1>
                    <p>+91 9123456780</p>
                </div>
                <div className='flex justify-around mt-15 mb-15'>
                    <div className='border w-[30%] rounded-xl h-[20vh] flex flex-col justify-center gap-5 items-center'>
                        <p>Membership Type</p>
                        <p className='text-2xl font-medium'>Basic</p>
                    </div>
                    <div className='border w-[30%] rounded-xl h-[20vh] flex flex-col justify-center gap-5 items-center'>
                        <p>Start Date</p>
                        <p className='text-2xl font-medium'>01-01-2000</p>
                    </div>
                    <div className='border w-[30%] rounded-xl h-[20vh] flex flex-col justify-center gap-5 items-center'>
                        <p>End Date</p>
                        <p className='text-2xl font-medium'>01-01-2000</p>
                    </div>
                </div>
                <div className=' flex justify-center gap-10'>
                    <Button className='w-[15%]'>
                        Edit
                    </Button>

                    <Button className='w-[15%]'>
                        Payment
                    </Button>
                </div>
            </div>
            <div className=' w-[20%]'>
                <p className='text-end'>
                    Active <StatusDot status={"Active"} />
                </p>
            </div>
        </div>
    );
}
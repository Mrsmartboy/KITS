import React from 'react'
import StatsChart from './StatsChart'

const BannerPageNew = () => {
    return (
        <div className="mt-24 pl-32 pr-16 bg-[url('/bannerbg.png')] dont-[Afacad]">
            <div className='grid grid-cols-[75%_25%]'>
                <div>
                    <div className='flex flex-row gap-8'>
                        <div className='flex flex-col justify-center'>
                            <div className='flex flex-row justify-end mb-4'>
                                <h1 className="text-[100px] leading-[100px] font-semibold tracking-[-0.5px] text-[#1A1A1A] text-center">
                                    It’s Not Just A Number
                                </h1>
                            </div>
                            <div className='flex flex-row justify-end'>
                                <h1 className="text-[40px] leading-[40px] font-normal capitalize text-black font-afacad">
                                    see successful students placements journey
                                </h1>
                            </div>
                        </div>
                        <div className='p-2 min-w-[250px]'>
                            <div className='border h-full border-[#000000] rounded-lg flex flex-col justify-between'>
                                <div className='p-4 text-right'>
                                    <div><h1 className='text-[#ED1334] text-[100px] leading-[64px] font-semibold'>3407+</h1></div>
                                    <div><h1 className='text-[28px] font-normal'>students placed</h1></div>
                                </div>
                                <div className='bg-black p-2 text-center justify-center flex flex-col'>
                                    <h1 className='text-[#FDFA01] text-[28px] '>{">>> still Counting...!"}</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='mt-16'>
                        <div className='grid grid-cols-[40%_50%]'>
                            <div className="">
                                <div className="flex flex-col gap-3">
                                    <div className="">
                                        <div className="grid grid-cols-7 min-h-[290px] max-h-[280px] gap-2">
                                            {/* Bar 2 */}
                                            <div className="flex flex-row justify-center text-center">
                                                <div className="w-[49px] flex flex-col justify-end h-full">
                                                    <div className="flex flex-col justify-end h-[230px] relative">
                                                        <div className="bg-[#132EE0] w-full" style={{ height: '70px' }}></div>
                                                        <h1 className="font-bold text-[20px] absolute bottom-[70px] w-full text-center">580</h1>
                                                    </div>
                                                    <h1 className="font-bold text-[20px] mt-1">2020</h1>
                                                </div>
                                            </div>

                                            {/* Bar 3 */}
                                            <div className="flex flex-row justify-center text-center">
                                                <div className="w-[49px] flex flex-col justify-end h-full">
                                                    <div className="flex flex-col justify-end h-[230px] relative">
                                                        <div className="bg-[#132EE0] w-full" style={{ height: '116px' }}></div>
                                                        <h1 className="font-bold text-[20px] absolute bottom-[116px] w-full text-center">951</h1>
                                                    </div>
                                                    <h1 className="font-bold text-[20px] mt-1">2021</h1>
                                                </div>
                                            </div>

                                            {/* Bar 4 */}
                                            <div className="flex flex-row justify-center text-center">
                                                <div className="w-[49px] flex flex-col justify-end h-full">
                                                    <div className="flex flex-col justify-end h-[230px] relative">
                                                        <div className="bg-[#132EE0] w-full" style={{ height: '148px' }}></div>
                                                        <h1 className="font-bold text-[20px] absolute bottom-[148px] w-full text-center">1222</h1>
                                                    </div>
                                                    <h1 className="font-bold text-[20px] mt-1">2022</h1>
                                                </div>
                                            </div>

                                            {/* Bar 5 */}
                                            <div className="flex flex-row justify-center text-center">
                                                <div className="w-[49px] flex flex-col justify-end h-full">
                                                    <div className="flex flex-col justify-end h-[230px] relative">
                                                        <div className="bg-[#132EE0] w-full" style={{ height: '187px' }}></div>
                                                        <h1 className="font-bold text-[20px] absolute bottom-[187px] w-full text-center">2504</h1>
                                                    </div>
                                                    <h1 className="font-bold text-[20px] mt-1">2023</h1>
                                                </div>
                                            </div>

                                            {/* Bar 6 */}
                                            <div className="flex flex-row justify-center text-center">
                                                <div className="w-[49px] flex flex-col justify-end h-full">
                                                    <div className="flex flex-col justify-end h-[230px] relative">
                                                        <div className="bg-[#132EE0] w-full" style={{ height: '222px' }}></div>
                                                        <h1 className="font-bold text-[20px] absolute bottom-[222px] w-full text-center">3407</h1>
                                                    </div>
                                                    <h1 className="font-bold text-[20px] mt-1">2024</h1>
                                                </div>
                                            </div>

                                            {/* Bar 7 */}
                                            <div className="flex flex-row justify-center text-center">
                                                <div className="w-[49px] flex flex-col justify-end h-full">
                                                    <div className="flex flex-col justify-end h-[230px] relative">
                                                        <div className="bg-[#132EE0] w-full" style={{ height: '260px' }}></div>
                                                        <h1 className="font-bold text-[20px] absolute bottom-[230px] w-full text-center">4000</h1>
                                                    </div>
                                                    <h1 className="font-bold text-[20px] mt-1">2025</h1>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <div className='flex flex-row justify-center'>
                                        <h1 className='text-[30px] font-normal leading-[30px]'>
                                            In the span of <span className='font-bold text-[#ED1334]'>6 years </span>
                                        </h1>
                                    </div>
                                </div>

                            </div>


                            <div className="">
                                <div>
                                    <video
                                        src="https://res.cloudinary.com/db2bpf0xw/video/upload/v1735634495/Placement_tt4kwi.mp4"
                                        className="max-w-full h-full rounded-lg"
                                        controls
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <div className=''>
                    <img src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849439/banner-girl_i195ik.webp" />
                </div>
            </div>
        </div>
    )
}

export default BannerPageNew
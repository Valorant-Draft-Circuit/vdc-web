
export default async function SettingsPanel() {
    return(
        <div className="bg-gradient-to-r from-vdcRed from-50% to-vdcWhite to-50% py-8 mx-2 rounded-2xl flex flex-row space-y-2 shadow-2xl lg:px-0 lg:px lg:ml-0 lg:justify-between lg:my-auto lg:max-w-12/12">
            <div className="flex flex-col w-full"> 
                <div className="items-end mx-10 text-start ">
                    <h1 className="italic text-3xl text-vdcBlack"> 
                        Settings 
                    </h1>
                    <p className="text-vdcWhite text-md italic px-10 text-wrap"> 
                        Customize your VDC website experience 
                    </p>
                </div>
                <div className="mx-10">
                    {/* <Image
                        src="/vdc-flame.svg"
                        alt="flame"
                        width={250}
                        height={500}
                        className="absolute inset-1 -z-10 size-full object-cover sm:object-top lg:object-[10%_10%] xl:scale-150 xl:absolute xl:left-20 xl:top-20 brightness-65 "
                    /> */}
                </div>
                    
            </div>
        </div>
    )
}
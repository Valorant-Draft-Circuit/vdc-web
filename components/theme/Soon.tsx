import Image from "next/image";

export default function Soon() {
  return (
    <div className="font-montserrat flex flex-col text-center m-auto text-7xl min-h-screen items-center align-middle text-primary-vdcRed dark:bg-primary-vdcBlack">
      <div className="flex flex-col m-auto gap-y-10">
        <div>
          <h1>COMING SOON</h1>
          <h3 className="text-lg text-black dark:text-white font-roboto">
            VDC Tech Team is working hard to bring you guys more features!
          </h3>
        </div>
        <Image
          className="m-auto"
          src={'/vdcTech.webp'}
          alt="VDC Tech Logo"
          width={500}
          height={50}
        />
      </div>
    </div>
  );
}

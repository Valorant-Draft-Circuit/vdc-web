import Image from "next/image";

export default function DiscordBadge({ image, name }: { image; name }) {
  return (
    <div className="flex flex-row rounded-full p-2 bg-radial from-[#5865F2] to-[rgb(93,106,255)] ">
      <Image
        src={image}
        alt={name}
        width={250}
        height={250}
        className="rounded-full size-5 m-auto"
      />
      <h2>{name}</h2>
    </div>
  );
}

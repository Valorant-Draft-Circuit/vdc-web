import Image from "next/image";

export default function DiscordBadge({ image, name }: { image; name }) {
  return (
    <div className="flex flex-row rounded-2xl px-4 py-2 bg-[#2b2f33]">
      <Image
        src={image}
        alt={name}
        width={250}
        height={250}
        className="rounded-full size-12"
      />
      <h2>{name}</h2>
    </div>
  );
}

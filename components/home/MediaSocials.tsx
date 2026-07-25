import { SOCIAL_PLATFORMS } from "@/components/common/socials";

export default function MediaSocials() {
  return (
    <div className="px-4 py-2 sm:px-6">
      <div className="grid grid-cols-2 gap-2">
        {SOCIAL_PLATFORMS.map((platform) => (
          <a
            key={platform.name}
            href={platform.href}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-white transition hover:opacity-90 ${platform.buttonClass}`}
          >
            <platform.icon aria-hidden="true" className="size-4 flex-none" />
            <h2>{platform.name}</h2>
          </a>
        ))}
      </div>
    </div>
  );
}

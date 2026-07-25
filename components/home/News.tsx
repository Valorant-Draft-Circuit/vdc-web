import { getNews } from "@/lib/queries/home/posts";
import Image from "next/image";

export default async function News() {
  const newsList = await getNews();

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {newsList.map(
        ({ title, date, featured_image, url, featured_image_alt }, i) => (
          <div
            className="xl:w-full hover:scale-101 transition duration-150 ease-in-out"
            key={i}
          >
            <a href={url ?? ""} target="_blank">
              <div className="shrink-0 ">
                <Image
                  src={featured_image ?? "/vdc-flame.svg"}
                  alt={featured_image_alt ?? "Featured Image"}
                  width={2000}
                  height={1000}
                  className="rounded-t-sm w-fit"
                />
              </div>
              <div className="bg-gray-200 dark:bg-vdcGrey p-4 xl:h-36 xl:w-full rounded-b-sm my-auto">
                <h1 className="font-bold text-sm text-vdcRed">{date}</h1>
                <h1 className="mt-1 text-vdcBlack dark:text-vdcWhite">
                  {title}
                </h1>
              </div>
            </a>
          </div>
        ),
      )}
    </div>
  );
}

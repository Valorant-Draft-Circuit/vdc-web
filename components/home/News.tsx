import { getNews } from "@/lib/queries/home/posts";
import Image from "next/image";
import Link from "next/link";

export default async function News() {
  const newsList = await getNews();

  return (
    <div className="flex flex-col xl:flex-row space-y-4 xl:space-x-4">
      {newsList.map(
        ({ title, date, featured_image, url, featured_image_alt }) => (
          <div
            className="xl:w-full hover:scale-105 transition duration-150 ease-in-out 4xl:hover:scale-102"
            key={date}
          >
            <Link href={url ?? ""}>
              <div className="shrink-0 ">
                <Image
                  src={featured_image ?? "/vdc-flame.svg"}
                  alt={featured_image_alt ?? "Featured Image"}
                  width={2000}
                  height={1000}
                  className="rounded-t-lg"
                />
              </div>
              <div className="bg-gray-200 dark:bg-vdcGrey p-4 xl:h-36 xl:w-full rounded-b-lg my-auto">
                <h1 className="font-bold text-sm text-vdcRed">{date}</h1>
                <h1 className="mt-1 text-vdcBlack dark:text-vdcWhite">
                  {title}
                </h1>
              </div>
            </Link>
          </div>
        )
      )}
    </div>
  );
}

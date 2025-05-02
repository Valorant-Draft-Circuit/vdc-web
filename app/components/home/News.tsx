import Link from "next/link";

const exampleNews = [
  {
    title: "I ATE A BABY AND IT TASTED GOOD",
    date: "12/2/2024",
    thumbnail: "I ALALALALALALALLALALALALALA !!!KASJAJS",
    url: "https://blog.vdc.gg",
  },
  {
    title: "I FARTED REALLY LOUD IN THE LIBRARY AND SOME POOP MADE IT OUT",
    date: "12/3/2024",
    thumbnail: "adsfasdf",
    url: "blog.vdc.gg",
  },
  {
    title: "I NEED TO PEE AND I CANT BECAUSE IM IN A MEETING",
    date: "12/4/2024",
    thumbnail: "adsfasdf",
    url: "blog.vdc.gg",
  },
];

export default function News() {
  return (
    <div className="flex flex-col xl:flex-row space-y-4 xl:space-x-4">
      {exampleNews.map(({ title, date, thumbnail, url }) => (
        <div className="xl:w-64" key={date}>
          <Link href={url}>
            <div className="shrink-0">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 200 200"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="h-56 xl:h-48 w-full border border-gray-300 bg-white text-gray-300"
              >
                <path
                  d="M0 0l200 200M0 200L200 0"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="bg-gray-200 p-4 xl:h-36">
              <h1 className="font-bold text-sm text-vdcGray">{date}</h1>
              <h1 className="mt-1 text-vdcBlack">{title}</h1>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

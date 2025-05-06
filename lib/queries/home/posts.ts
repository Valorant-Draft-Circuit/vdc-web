import GhostContentAPI, { Nullable } from "@tryghost/content-api";

const api = new GhostContentAPI({
  url: "https://blog.vdc.gg",
  key: process.env.GHOST_API_KEY || "",
  version: "v5.0",
});

export interface NewsProps {
  title: string | undefined;
  url: string | undefined;
  date: Nullable<string> | undefined;
  featured_image: Nullable<string> | undefined;
  featured_image_alt: Nullable<string>;
}

export async function getNews(): Promise<NewsProps[]> {
  try {
    const payload = await api.posts.browse({
      limit: 3,
      filter: "feature_image:-null",
    });

    return payload.map((post) => {
      const formattedDate = formatDate(post.published_at);
      return {
        title: post.title,
        date: formattedDate,
        url: post.url,
        featured_image: post.feature_image ?? null,
        featured_image_alt: post.feature_image_alt ?? null,
      };
    });
  } catch (err) {
    console.error(err);
    return [];
  }
}

function formatDate(published_at: Nullable<string> | undefined) {
  let formattedDate: string | undefined = undefined;

  if (published_at) {
    new Date().toLocaleDateString();
    formattedDate = new Date(published_at).toLocaleDateString("en-US");
  }
  return formattedDate;
}

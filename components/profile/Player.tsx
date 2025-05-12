"use client";

import { useEffect, useState } from "react";

export default function Player({ riotIGN }: { riotIGN }) {
  const [search, setSearch] = useState("");
  const [found, setFound] = useState(false);
  useEffect(() => {
    decodeSearch(riotIGN, setSearch);
  }, []);

  return <h1>{search}</h1>;
}

function decodeSearch(pathname, setSearch) {
  const rawSegment = pathname.split("/").pop()!;
  const search = decodeURIComponent(rawSegment);
  const discriminator = decodeURIComponent(window.location.hash);
  setSearch(search + discriminator);
}

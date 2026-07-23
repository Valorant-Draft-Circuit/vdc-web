"use client";

import { recordProfileView } from "@/app/player/[player]/actions";
import { useEffect, useRef } from "react";

export default function ProfileViewTracker({
  profileUserID,
}: {
  profileUserID: string;
}) {
  const recordedProfileUserID = useRef<string | null>(null);

  useEffect(() => {
    if (recordedProfileUserID.current === profileUserID) return;
    recordedProfileUserID.current = profileUserID;
    void recordProfileView(profileUserID);
  }, [profileUserID]);

  return null;
}

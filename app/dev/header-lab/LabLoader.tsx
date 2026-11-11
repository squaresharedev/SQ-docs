"use client";

import dynamic from "next/dynamic";

/** The lab's state lives in the hash, which the server never sees: client only. */
export const LabLoader = dynamic(() => import("./HeaderLab").then((m) => m.HeaderLab), { ssr: false });

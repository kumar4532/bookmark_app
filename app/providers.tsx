"use client";

import { Toaster } from "react-hot-toast";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    className:
                        "bg-zinc-900 text-white border border-zinc-800 shadow-lg",
                }}
            />
        </>
    );
}
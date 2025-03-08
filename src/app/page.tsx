"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { formatDate, useNovelStore } from "@/lib/stores/novels-store";
import Link from "next/link";

export default function Page() {
  const novels = useNovelStore((state) => state.novels);
  return (
    <div className="w-full mx-auto p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
        {Object.values(novels).map((novel) => (
          <Link key={novel.id} href={`/${novel.id}`}>
            <Card>
              <CardHeader>
                <CardTitle>{novel.config.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {novel.config.genre.join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Card Content</p>
              </CardContent>
              <CardFooter className="flex items-center justify-end">
                <p className="text-xs text-zinc-400">
                  Edited {formatDate(novel.editedAt)}
                </p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

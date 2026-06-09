import React from "react";
import { cn } from "@/lib/utils"

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls
}) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => (
        <a
          key={index}
          href={url.profileUrl}
          target="_blank"
          rel="noopener noreferrer">
          <img
            className="h-10 w-10 rounded-full border-2 border-[#FD8566]"
            src={url.imageUrl}
            width={40}
            height={40}
            alt={`Avatar ${index + 1}`} />
        </a>
      ))}
      {(numPeople ?? 0) > 0 && (
        <a
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#FD8566] text-center text-xs font-medium text-[#133B6C] hover:bg-white dark:bg-white"
          href="">
          +{numPeople}
        </a>
      )}
    </div>
  );
}
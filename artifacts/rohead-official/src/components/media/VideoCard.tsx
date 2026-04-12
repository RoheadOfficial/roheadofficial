import { PlayCircle } from "lucide-react";
import type { Video } from "@workspace/api-client-react";

export function VideoCard({ video }: { video: Video }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-border/40">
        <img 
          src={video.thumbnail || "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop"} 
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100">
          <PlayCircle className="w-14 h-14 text-white drop-shadow-lg" />
        </div>
      </div>
      <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
        {video.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {video.description}
      </p>
    </div>
  );
}

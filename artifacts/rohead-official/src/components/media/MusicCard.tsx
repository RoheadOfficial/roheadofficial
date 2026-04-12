import { Play } from "lucide-react";
import type { Music } from "@workspace/api-client-react";

export function MusicCard({ music }: { music: Music }) {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300">
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={music.coverImage || "https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=600&auto=format&fit=crop"} 
          alt={music.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl">
            <Play className="w-5 h-5 ml-1" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-base truncate" title={music.title}>{music.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{music.artist}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
            {music.genre}
          </span>
        </div>
      </div>
    </div>
  );
}

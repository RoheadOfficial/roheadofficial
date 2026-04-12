import { useGetPublicHome } from "@workspace/api-client-react";
import { MusicCard } from "@/components/media/MusicCard";
import { VideoCard } from "@/components/media/VideoCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Play, ArrowRight } from "lucide-react";

export function Home() {
  const { data, isLoading } = useGetPublicHome();

  if (isLoading) {
    return <div className="h-[80vh] flex items-center justify-center">Loading...</div>;
  }

  const { settings, featuredMusic, latestVideos, recommendedMusic } = data || {};

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-12">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden flex items-center">
        {settings?.bannerUrl && (
          <>
            <div className="absolute inset-0 z-0">
              <img 
                src={settings.bannerUrl} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </>
        )}
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              {settings?.siteName || "ROHEAD OFFICIAL"}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              {settings?.description || "The premium destination for exclusive music and cinematic video content."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/music">
                <Button size="lg" className="rounded-full px-8 gap-2 font-bold hover-elevate">
                  <Play className="w-5 h-5" fill="currentColor" />
                  Listen Now
                </Button>
              </Link>
              <Link href="/videos">
                <Button size="lg" variant="secondary" className="rounded-full px-8 gap-2 font-bold hover-elevate">
                  Watch Videos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Music */}
      {featuredMusic && featuredMusic.length > 0 && (
        <section className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Releases</h2>
              <p className="text-muted-foreground mt-1">Fresh sounds from the studio.</p>
            </div>
            <Link href="/music">
              <Button variant="ghost" className="gap-2 hidden md:flex rounded-full">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {featuredMusic.slice(0, 5).map(music => (
              <MusicCard key={music.id} music={music} />
            ))}
          </div>
          
          <div className="mt-6 md:hidden">
            <Link href="/music">
              <Button variant="outline" className="w-full rounded-full">
                View All Music
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Latest Videos */}
      {latestVideos && latestVideos.length > 0 && (
        <section className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Cinematic Visuals</h2>
              <p className="text-muted-foreground mt-1">Latest music videos and behind-the-scenes.</p>
            </div>
            <Link href="/videos">
              <Button variant="ghost" className="gap-2 hidden md:flex rounded-full">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {latestVideos.slice(0, 3).map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}
      
      {/* About Section */}
      {settings?.aboutText && (
        <section className="container mx-auto px-4 md:px-6 py-12">
          <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto text-center glass-panel">
            <h2 className="text-2xl font-bold mb-6">About the Creator</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {settings.aboutText}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

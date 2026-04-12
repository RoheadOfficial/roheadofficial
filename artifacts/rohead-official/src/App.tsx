import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Route, Router as WouterRouter, Switch } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  getGetAdminDashboardQueryKey,
  getGetAdminSettingsQueryKey,
  getGetMeQueryKey,
  getGetPublicHomeQueryKey,
  getListAdminMusicQueryKey,
  getListAdminUsersQueryKey,
  getListAdminVideosQueryKey,
  setAuthTokenGetter,
  useCreateAdminMusic,
  useCreateAdminUser,
  useCreateAdminVideo,
  useDeleteAdminMusic,
  useDeleteAdminUser,
  useDeleteAdminVideo,
  useGetAdminDashboard,
  useGetAdminSettings,
  useGetAuthStatus,
  useGetMe,
  useGetPublicHome,
  useListAdminMusic,
  useListAdminUsers,
  useListAdminVideos,
  useListPublicMusic,
  useListPublicVideos,
  useLogin,
  useSignup,
  useUpdateAdminSettings,
  useUpdateAdminUser,
} from "@workspace/api-client-react";
import type {
  MediaMusicInput,
  MediaVideoInput,
  Music,
  Permissions,
  SiteSettings,
  UpdateSettingsInput,
  User,
  Video,
} from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { BarChart3, Check, Clapperboard, Disc3, ExternalLink, Lock, LogOut, Menu, Paintbrush, Play, Settings, Shield, Sparkles, Users, X } from "lucide-react";

const queryClient = new QueryClient();
const themes = ["light", "dark", "ocean", "purple", "pink", "red"] as const;
const permissions = ["canUploadMusic", "canUploadVideo", "canEditSite", "canDeleteContent", "canManageUsers"] as const;
const emptyPermissions: Permissions = {
  canUploadMusic: false,
  canUploadVideo: false,
  canEditSite: false,
  canDeleteContent: false,
  canManageUsers: false,
};
const musicInitial: MediaMusicInput = {
  title: "",
  description: "",
  coverImage: "",
  embedLink: "",
  genre: "",
  artist: "Rohead",
  producer: "",
  featured: false,
};
const videoInitial: MediaVideoInput = {
  title: "",
  description: "",
  thumbnail: "",
  videoLink: "",
  featured: false,
  trending: false,
};

setAuthTokenGetter(() => localStorage.getItem("rohead_token"));

function authHeaders(token: string | null): RequestInit | undefined {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
}

function applyTheme(theme: string) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme !== "light");
  root.dataset.theme = theme;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/.22),transparent_32rem),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))] text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/65 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground transition-transform group-hover:scale-105"><Disc3 className="size-5" /></div>
            <div>
              <p className="text-sm uppercase tracking-[0.38em] text-muted-foreground">ROHEAD</p>
              <p className="font-semibold tracking-wide">OFFICIAL</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink href="/music">Music</NavLink>
            <NavLink href="/videos">Videos</NavLink>
            <NavLink href="/admin">Admin</NavLink>
          </nav>
          <button className="rounded-full border border-white/10 p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Open menu"><Menu className="size-5" /></button>
        </div>
        {open && (
          <div className="border-t border-white/10 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              <NavLink href="/music">Music</NavLink>
              <NavLink href="/videos">Videos</NavLink>
              <NavLink href="/admin">Admin</NavLink>
            </div>
          </div>
        )}
      </header>
      {children}
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground">{children}</Link>;
}

function LoadingScreen({ label = "Loading ROHEAD OFFICIAL" }: { label?: string }) {
  return <div className="grid min-h-[55vh] place-items-center"><div className="rounded-3xl border border-white/10 bg-white/8 px-8 py-6 text-center backdrop-blur-xl"><Disc3 className="mx-auto mb-4 size-8 animate-spin text-primary" /><p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">{label}</p></div></div>;
}

function ErrorPanel({ message }: { message: string }) {
  return <div className="mx-auto my-8 max-w-2xl rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-100">{message}</div>;
}

function HomePage() {
  const home = useGetPublicHome();
  useEffect(() => {
    if (home.data?.settings.defaultTheme) applyTheme(home.data.settings.defaultTheme);
  }, [home.data?.settings.defaultTheme]);
  if (home.isLoading) return <Shell><LoadingScreen /></Shell>;
  if (!home.data) return <Shell><ErrorPanel message="Home content could not be loaded." /></Shell>;
  const { settings, featuredMusic, latestVideos, recommendedMusic } = home.data;
  const heroImage = settings.bannerUrl || latestVideos[0]?.thumbnail || featuredMusic[0]?.coverImage;
  return (
    <Shell>
      <main>
        <section className="relative min-h-[78vh] overflow-hidden">
          {heroImage && <img src={heroImage} alt="ROHEAD hero" className="absolute inset-0 size-full object-cover opacity-55" loading="eager" />}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--background))_0%,hsl(var(--background)/.78)_40%,transparent),linear-gradient(0deg,hsl(var(--background))_0%,transparent_55%)]" />
          <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/.45),transparent_28rem)]" />
          <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl py-24">
              <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.36em] backdrop-blur-xl">Premium Creator Platform</p>
              <h1 className="text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl">{settings.siteName}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">{settings.description}</p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/music" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:scale-105"><Play className="mr-2 inline size-4" />Enter Music</Link>
                <Link href="/videos" className="rounded-full border border-white/15 bg-white/10 px-6 py-3 font-semibold backdrop-blur-xl transition hover:scale-105"><Clapperboard className="mr-2 inline size-4" />Enter Videos</Link>
              </div>
            </div>
          </div>
        </section>
        <MediaRow title="Featured Music" subtitle="Apple-clean releases curated for the front page">{featuredMusic.map((item) => <MusicCard key={item.id} item={item} />)}</MediaRow>
        <MediaRow title="Latest Videos" subtitle="Cinematic rows for new visual drops">{latestVideos.map((item) => <VideoCard key={item.id} item={item} />)}</MediaRow>
        <MediaRow title="Recommended" subtitle="More from the ROHEAD library">{recommendedMusic.map((item) => <MusicCard key={item.id} item={item} compact />)}</MediaRow>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 backdrop-blur-2xl sm:p-12">
            <p className="mb-3 text-sm uppercase tracking-[0.34em] text-primary">About</p>
            <p className="max-w-4xl text-2xl font-semibold leading-snug sm:text-4xl">{settings.aboutText}</p>
          </div>
        </section>
        <footer className="border-t border-white/10 px-4 py-10 text-center text-sm text-muted-foreground">{settings.footerText}</footer>
      </main>
    </Shell>
  );
}

function MediaRow({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-bold sm:text-3xl">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{subtitle}</p></div></div><div className="flex snap-x gap-5 overflow-x-auto pb-5 [scrollbar-width:none]">{children}</div></section>;
}

function MusicCard({ item, compact = false }: { item: Music; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return <article className={cx("group min-w-[230px] snap-start overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.07] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.11]", compact && "min-w-[200px]")}><button onClick={() => setOpen(true)} className="block w-full text-left"><div className="relative aspect-square overflow-hidden"><img src={item.coverImage} alt={item.title} className="size-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" /><div className="absolute bottom-4 left-4 grid size-11 place-items-center rounded-full bg-white text-black shadow-2xl transition group-hover:scale-110"><Play className="size-5 fill-current" /></div></div><div className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-primary">{item.genre}</p><h3 className="mt-2 line-clamp-1 font-bold">{item.title}</h3><p className="line-clamp-1 text-sm text-muted-foreground">{item.artist} · {item.producer}</p></div></button>{open && <PlayerModal title={item.title} subtitle={item.artist} src={item.embedLink} image={item.coverImage} onClose={() => setOpen(false)} />}</article>;
}

function VideoCard({ item }: { item: Video }) {
  const [open, setOpen] = useState(false);
  return <article className="group min-w-[310px] snap-start overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.07] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.11]"><button onClick={() => setOpen(true)} className="block w-full text-left"><div className="relative aspect-video overflow-hidden"><img src={item.thumbnail} alt={item.title} className="size-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" /><div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">{item.trending ? "Trending" : "Featured"}</div><div className="absolute bottom-4 left-4 grid size-12 place-items-center rounded-full bg-white text-black"><Play className="size-5 fill-current" /></div></div><div className="p-5"><h3 className="line-clamp-1 font-bold">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p></div></button>{open && <PlayerModal title={item.title} subtitle="Video" src={item.videoLink} image={item.thumbnail} onClose={() => setOpen(false)} />}</article>;
}

function PlayerModal({ title, subtitle, src, image, onClose }: { title: string; subtitle: string; src: string; image: string; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-xl" onClick={onClose}><div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}><img src={image} alt="" className="absolute inset-0 size-full object-cover opacity-15 blur-2xl" /><button className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 backdrop-blur" onClick={onClose}><X className="size-5" /></button><div className="relative p-5 sm:p-8"><p className="text-sm uppercase tracking-[0.28em] text-white/50">{subtitle}</p><h2 className="mb-5 text-2xl font-bold">{title}</h2><div className="aspect-video overflow-hidden rounded-3xl bg-black"><iframe src={src} title={title} className="size-full" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" /></div></div></div></div>;
}

function MusicPage() {
  const music = useListPublicMusic({ limit: 50 });
  return <Shell><main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><PageTitle icon={<Disc3 />} label="Music" title="Browse the ROHEAD catalog" subtitle="Embed-first releases with a clean mini-player flow." />{music.isLoading ? <LoadingScreen /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{music.data?.map((item) => <MusicCard key={item.id} item={item} />)}</div>}<MiniPlayer /></main></Shell>;
}

function VideosPage() {
  const videos = useListPublicVideos({ limit: 50 });
  const trending = videos.data?.filter((v) => v.trending) ?? [];
  const featured = videos.data?.filter((v) => v.featured) ?? [];
  return <Shell><main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><PageTitle icon={<Clapperboard />} label="Videos" title="Cinematic visual rows" subtitle="Netflix-style browsing with YouTube-first modal playback." />{videos.isLoading ? <LoadingScreen /> : <><MediaRow title="Trending Videos" subtitle="High-focus visual drops">{trending.map((item) => <VideoCard key={item.id} item={item} />)}</MediaRow><MediaRow title="Latest Uploads" subtitle="Fresh from the ROHEAD archive">{(videos.data ?? []).map((item) => <VideoCard key={item.id} item={item} />)}</MediaRow><MediaRow title="Featured" subtitle="Pinned visual releases">{featured.map((item) => <VideoCard key={item.id} item={item} />)}</MediaRow></>}</main></Shell>;
}

function PageTitle({ icon, label, title, subtitle }: { icon: React.ReactNode; label: string; title: string; subtitle: string }) {
  return <div className="mb-10 rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 backdrop-blur-2xl"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-sm text-primary">{icon}{label}</div><h1 className="text-4xl font-black tracking-tight sm:text-6xl">{title}</h1><p className="mt-4 max-w-2xl text-muted-foreground">{subtitle}</p></div>;
}

function MiniPlayer() {
  return <div className="sticky bottom-4 z-30 mx-auto mt-10 flex max-w-3xl items-center gap-4 rounded-full border border-white/10 bg-background/75 p-3 shadow-2xl backdrop-blur-2xl"><div className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"><Play className="size-4 fill-current" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Ready to play</p><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/3 rounded-full bg-primary" /></div></div><div className="hidden text-xs text-muted-foreground sm:block">Embed-first player</div></div>;
}

function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem("rohead_token"));
  const status = useGetAuthStatus();
  const me = useGetMe({ query: { enabled: !!token, queryKey: getGetMeQueryKey() }, request: authHeaders(token) });
  const logout = () => { localStorage.removeItem("rohead_token"); setToken(null); queryClient.clear(); };
  return <Shell><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{!token || !me.data ? <AuthPanel status={status.data} setToken={setToken} /> : <AdminConsole token={token} user={me.data} logout={logout} />}</main></Shell>;
}

function AuthPanel({ status, setToken }: { status?: { hasAdmin: boolean; signupEnabled: boolean }; setToken: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useLogin({ mutation: { onSuccess: (data) => { localStorage.setItem("rohead_token", data.token); setToken(data.token); }, onError: (e) => setError((e as Error).message) } });
  const signup = useSignup({ mutation: { onSuccess: (data) => { localStorage.setItem("rohead_token", data.token); setToken(data.token); }, onError: (e) => setError((e as Error).message) } });
  const isSetup = !status?.hasAdmin;
  const submit = (e: FormEvent) => { e.preventDefault(); setError(""); const payload = { email, password }; if (isSetup) signup.mutate({ data: payload }); else login.mutate({ data: payload }); };
  return <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_.9fr]"><div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 backdrop-blur-2xl"><p className="mb-4 inline-flex rounded-full bg-primary/15 px-4 py-2 text-sm text-primary"><Lock className="mr-2 size-4" />{isSetup ? "First admin setup" : "Admin login"}</p><h1 className="text-4xl font-black">Control center access</h1><p className="mt-4 text-muted-foreground">{isSetup ? "Create the first account. It automatically becomes the admin with all permissions." : "Public signup is locked. Sign in to manage ROHEAD OFFICIAL."}</p></div><form onSubmit={submit} className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 backdrop-blur-2xl"><Field label="Email" value={email} onChange={setEmail} type="email" /><Field label="Password" value={password} onChange={setPassword} type="password" /><button className="mt-5 w-full rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground transition hover:scale-[1.02]" disabled={login.isPending || signup.isPending}>{isSetup ? "Create admin" : "Login"}</button>{error && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-200">{error}</p>}</form></div>;
}

function AdminConsole({ token, user, logout }: { token: string; user: User; logout: () => void }) {
  const [tab, setTab] = useState("dashboard");
  const tabs = [
    ["dashboard", "Dashboard", BarChart3], ["settings", "Website Settings", Settings], ["music", "Music Manager", Disc3], ["videos", "Video Manager", Clapperboard], ["users", "User Manager", Users], ["theme", "Theme Manager", Paintbrush],
  ] as const;
  return <div className="grid gap-6 lg:grid-cols-[280px_1fr]"><aside className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-2xl"><div className="mb-5 rounded-3xl bg-primary/15 p-4"><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Signed in</p><p className="truncate font-bold">{user.email}</p><p className="mt-1 text-sm capitalize text-primary">{user.role}</p></div><div className="space-y-2">{tabs.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={cx("flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition", tab === id ? "bg-primary text-primary-foreground" : "hover:bg-white/10")}><Icon className="size-4" />{label}</button>)}</div><button onClick={logout} className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-muted-foreground hover:bg-white/10"><LogOut className="size-4" />Logout</button></aside><section className="min-w-0 rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-2xl sm:p-8">{tab === "dashboard" && <Dashboard token={token} />}{tab === "settings" && <SettingsManager token={token} />}{tab === "music" && <MusicManager token={token} />}{tab === "videos" && <VideoManager token={token} />}{tab === "users" && <UserManager token={token} />}{tab === "theme" && <ThemeManager token={token} />}</section></div>;
}

function Dashboard({ token }: { token: string }) {
  const dashboard = useGetAdminDashboard({ request: authHeaders(token) });
  if (!dashboard.data) return <LoadingScreen label="Loading dashboard" />;
  const stats = [["Users", dashboard.data.totalUsers, Users], ["Music", dashboard.data.totalMusic, Disc3], ["Videos", dashboard.data.totalVideos, Clapperboard], ["Featured", dashboard.data.featuredMusic, Sparkles], ["Trending", dashboard.data.trendingVideos, BarChart3]] as const;
  return <div><SectionHead title="Dashboard" subtitle="Real counts from the ROHEAD database." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map(([label, value, Icon]) => <div key={label} className="rounded-3xl border border-white/10 bg-black/10 p-5"><Icon className="mb-4 size-5 text-primary" /><p className="text-3xl font-black">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>)}</div><div className="mt-6 rounded-3xl border border-white/10 p-5"><h3 className="font-bold">Recent activity</h3><div className="mt-4 space-y-3">{dashboard.data.recentActivity.length ? dashboard.data.recentActivity.map((a) => <p key={a} className="rounded-2xl bg-white/5 p-3 text-sm">{a}</p>) : <p className="text-sm text-muted-foreground">No activity yet.</p>}</div></div></div>;
}

function SettingsManager({ token }: { token: string }) {
  const qc = useQueryClient();
  const settings = useGetAdminSettings({ request: authHeaders(token) });
  const [form, setForm] = useState<UpdateSettingsInput>({});
  useEffect(() => { if (settings.data) setForm(settings.data); }, [settings.data]);
  const mutation = useUpdateAdminSettings({ request: authHeaders(token), mutation: { onSuccess: (data) => { applyTheme(data.defaultTheme); qc.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() }); qc.invalidateQueries({ queryKey: getGetPublicHomeQueryKey() }); } } });
  if (!settings.data) return <LoadingScreen label="Loading settings" />;
  return <div><SectionHead title="Website Settings" subtitle="Edit the public site name, hero, about text, footer, signup flow, and default theme." /><form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate({ data: form }); }}><Field label="Site name" value={form.siteName ?? ""} onChange={(v) => setForm({ ...form, siteName: v })} /><Field label="Description" value={form.description ?? ""} onChange={(v) => setForm({ ...form, description: v })} /><Field label="Banner URL" value={form.bannerUrl ?? ""} onChange={(v) => setForm({ ...form, bannerUrl: v })} /><Field label="Profile image URL" value={form.profileImageUrl ?? ""} onChange={(v) => setForm({ ...form, profileImageUrl: v })} /><TextArea label="About text" value={form.aboutText ?? ""} onChange={(v) => setForm({ ...form, aboutText: v })} /><Field label="Footer text" value={form.footerText ?? ""} onChange={(v) => setForm({ ...form, footerText: v })} /><SelectTheme value={(form.defaultTheme as string) ?? "dark"} onChange={(v) => { setForm({ ...form, defaultTheme: v as SiteSettings["defaultTheme"] }); applyTheme(v); }} /><label className="flex items-center gap-3 rounded-2xl bg-white/5 p-4"><input type="checkbox" checked={Boolean(form.publicSignupEnabled)} onChange={(e) => setForm({ ...form, publicSignupEnabled: e.target.checked })} /> Allow public signup after admin exists</label><SubmitButton saving={mutation.isPending}>Save settings</SubmitButton></form></div>;
}

function MusicManager({ token }: { token: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<MediaMusicInput>(musicInitial);
  const list = useListAdminMusic({ request: authHeaders(token) });
  const create = useCreateAdminMusic({ request: authHeaders(token), mutation: { onSuccess: () => { setForm(musicInitial); qc.invalidateQueries({ queryKey: getListAdminMusicQueryKey() }); qc.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() }); qc.invalidateQueries({ queryKey: getGetPublicHomeQueryKey() }); } } });
  const del = useDeleteAdminMusic({ request: authHeaders(token), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListAdminMusicQueryKey() }) } });
  return <div><SectionHead title="Music Manager" subtitle="Embed Spotify, Apple Music, SoundCloud, or YouTube music links. Uploads can be added later as a fallback." /><MediaForm type="music" form={form} setForm={setForm} onSubmit={() => create.mutate({ data: form })} saving={create.isPending} /><AdminList items={list.data ?? []} kind="music" onDelete={(id) => del.mutate({ id })} /></div>;
}

function VideoManager({ token }: { token: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<MediaVideoInput>(videoInitial);
  const list = useListAdminVideos({ request: authHeaders(token) });
  const create = useCreateAdminVideo({ request: authHeaders(token), mutation: { onSuccess: () => { setForm(videoInitial); qc.invalidateQueries({ queryKey: getListAdminVideosQueryKey() }); qc.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() }); qc.invalidateQueries({ queryKey: getGetPublicHomeQueryKey() }); } } });
  const del = useDeleteAdminVideo({ request: authHeaders(token), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListAdminVideosQueryKey() }) } });
  return <div><SectionHead title="Video Manager" subtitle="YouTube embeds first, optional upload fallback later." /><MediaForm type="video" form={form} setForm={setForm} onSubmit={() => create.mutate({ data: form })} saving={create.isPending} /><AdminList items={list.data ?? []} kind="video" onDelete={(id) => del.mutate({ id })} /></div>;
}

function UserManager({ token }: { token: string }) {
  const qc = useQueryClient();
  const users = useListAdminUsers({ request: authHeaders(token) });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "moderator" | "user">("user");
  const [perms, setPerms] = useState<Permissions>(emptyPermissions);
  const create = useCreateAdminUser({ request: authHeaders(token), mutation: { onSuccess: () => { setEmail(""); setPassword(""); setPerms(emptyPermissions); qc.invalidateQueries({ queryKey: getListAdminUsersQueryKey() }); } } });
  const update = useUpdateAdminUser({ request: authHeaders(token), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListAdminUsersQueryKey() }) } });
  const del = useDeleteAdminUser({ request: authHeaders(token), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListAdminUsersQueryKey() }) } });
  return <div><SectionHead title="User Manager" subtitle="Create accounts, assign roles, and toggle canXXX permissions." /><form className="mb-6 grid gap-4 rounded-3xl border border-white/10 p-4" onSubmit={(e) => { e.preventDefault(); create.mutate({ data: { email, password, role, permissions: perms } }); }}><div className="grid gap-4 md:grid-cols-3"><Field label="Email" value={email} onChange={setEmail} type="email" /><Field label="Password" value={password} onChange={setPassword} type="password" /><label className="text-sm font-medium">Role<select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><option value="user">user</option><option value="moderator">moderator</option><option value="admin">admin</option></select></label></div><PermissionToggles value={perms} onChange={setPerms} /><SubmitButton saving={create.isPending}>Create user</SubmitButton></form><div className="space-y-3">{users.data?.map((u) => <div key={u.id} className="rounded-3xl border border-white/10 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold">{u.email}</p><p className="text-sm capitalize text-primary">{u.role}</p></div><button onClick={() => del.mutate({ id: u.id })} className="rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-200">Delete</button></div><PermissionToggles value={u.permissions} onChange={(p) => update.mutate({ id: u.id, data: { role: u.role, permissions: p } })} /></div>)}</div></div>;
}

function ThemeManager({ token }: { token: string }) {
  const settings = useGetAdminSettings({ request: authHeaders(token) });
  const qc = useQueryClient();
  const update = useUpdateAdminSettings({ request: authHeaders(token), mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() }); qc.invalidateQueries({ queryKey: getGetPublicHomeQueryKey() }); } } });
  const active = settings.data?.defaultTheme ?? "dark";
  return <div><SectionHead title="Theme Manager" subtitle="Set the global ROHEAD theme across backgrounds, text, cards, modals, navbar, player, and hover effects." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{themes.map((theme) => <button key={theme} onClick={() => { applyTheme(theme); update.mutate({ data: { defaultTheme: theme } }); }} className={cx("rounded-3xl border p-6 text-left capitalize transition hover:-translate-y-1", active === theme ? "border-primary bg-primary/15" : "border-white/10 bg-white/5")} data-theme={theme}><Paintbrush className="mb-5 size-6 text-primary" /><p className="text-xl font-black">{theme}</p><p className="mt-2 text-sm text-muted-foreground">Bright, clean, premium global theme.</p></button>)}</div></div>;
}

function MediaForm({ type, form, setForm, onSubmit, saving }: { type: "music"; form: MediaMusicInput; setForm: (f: MediaMusicInput) => void; onSubmit: () => void; saving: boolean } | { type: "video"; form: MediaVideoInput; setForm: (f: MediaVideoInput) => void; onSubmit: () => void; saving: boolean }) {
  return <form className="mb-6 grid gap-4 rounded-3xl border border-white/10 p-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}><div className="grid gap-4 md:grid-cols-2"><Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v } as never)} /><Field label={type === "music" ? "Cover image URL" : "Thumbnail URL"} value={type === "music" ? form.coverImage : form.thumbnail} onChange={(v) => setForm({ ...form, [type === "music" ? "coverImage" : "thumbnail"]: v } as never)} /><Field label={type === "music" ? "Embed link" : "Video link"} value={type === "music" ? form.embedLink : form.videoLink} onChange={(v) => setForm({ ...form, [type === "music" ? "embedLink" : "videoLink"]: v } as never)} />{type === "music" && <><Field label="Genre" value={form.genre} onChange={(v) => setForm({ ...form, genre: v })} /><Field label="Artist" value={form.artist} onChange={(v) => setForm({ ...form, artist: v })} /><Field label="Producer" value={form.producer} onChange={(v) => setForm({ ...form, producer: v })} /></>}</div><TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v } as never)} /><div className="flex flex-wrap gap-3"><label className="rounded-full bg-white/5 px-4 py-2 text-sm"><input className="mr-2" type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked } as never)} />Featured</label>{type === "video" && <label className="rounded-full bg-white/5 px-4 py-2 text-sm"><input className="mr-2" type="checkbox" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} />Trending</label>}</div><SubmitButton saving={saving}>Add {type}</SubmitButton><p className="text-xs text-muted-foreground"><ExternalLink className="mr-1 inline size-3" />Tip: paste platform embed URLs for the smoothest playback.</p></form>;
}

function AdminList({ items, kind, onDelete }: { items: Array<Music | Video>; kind: "music" | "video"; onDelete: (id: number) => void }) {
  return <div className="space-y-3">{items.map((item) => <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-white/10 p-4 sm:flex-row sm:items-center"><img src={kind === "music" ? (item as Music).coverImage : (item as Video).thumbnail} alt={item.title} className="h-24 w-full rounded-2xl object-cover sm:w-36" /><div className="min-w-0 flex-1"><p className="font-bold">{item.title}</p><p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p></div><button onClick={() => onDelete(item.id)} className="rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-200">Delete</button></div>)}</div>;
}

function PermissionToggles({ value, onChange }: { value: Permissions; onChange: (p: Permissions) => void }) {
  return <div className="mt-4 flex flex-wrap gap-2">{permissions.map((p) => <button type="button" key={p} onClick={() => onChange({ ...value, [p]: !value[p] })} className={cx("rounded-full border px-3 py-2 text-xs transition", value[p] ? "border-primary bg-primary text-primary-foreground" : "border-white/10 bg-white/5 text-muted-foreground")}><Check className="mr-1 inline size-3" />{p}</button>)}</div>;
}

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="mb-6"><p className="text-sm uppercase tracking-[0.3em] text-primary">Control Center</p><h2 className="mt-2 text-3xl font-black">{title}</h2><p className="mt-2 text-muted-foreground">{subtitle}</p></div>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="text-sm font-medium">{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-primary" required={label === "Email" || label === "Password" || label === "Title"} /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-sm font-medium">{label}<textarea value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-primary" /></label>;
}

function SelectTheme({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="text-sm font-medium">Default theme<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 capitalize outline-none">{themes.map((theme) => <option key={theme} value={theme}>{theme}</option>)}</select></label>;
}

function SubmitButton({ saving, children }: { saving: boolean; children: React.ReactNode }) {
  return <button disabled={saving} className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-60">{saving ? "Saving..." : children}</button>;
}

function Router() {
  return <Switch><Route path="/" component={HomePage} /><Route path="/music" component={MusicPage} /><Route path="/videos" component={VideosPage} /><Route path="/admin" component={AdminPage} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;

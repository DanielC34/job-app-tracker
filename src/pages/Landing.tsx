import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, BarChart3, Bell, FileText, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Briefcase,
    title: "Track Applications",
    description: "Organize every application from wishlist to offer in one clean view.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Insights",
    description: "See your pipeline at a glance — stages, activity, and follow-ups.",
  },
  {
    icon: Bell,
    title: "Follow-up Reminders",
    description: "Never miss a follow-up. Get notified when action is due.",
  },
  {
    icon: FileText,
    title: "Resume Versions",
    description: "Track which resume you sent where. Upload and link versions.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-14 items-center justify-between">
          <span className="font-heading text-lg font-bold text-primary">ApplyFlow</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">Log in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="px-2 sm:px-3">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 sm:py-20 md:py-32 text-center">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
          Your job search,{" "}
          <span className="text-primary">organized</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          Stop losing track of applications in spreadsheets. ApplyFlow gives you a clean pipeline
          to manage every opportunity from first click to offer.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-20">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border bg-card p-5 sm:p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ApplyFlow. Built to help you land your next role.
        </div>
      </footer>
    </div>
  );
}

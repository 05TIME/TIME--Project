import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Book, MessageCircle, Video, FileText } from "lucide-react";
import Link from "next/link";

const helpSections = [
  {
    title: "Documentation",
    description: "Learn how to use $TIMEOE with detailed guides",
    icon: Book,
    href: "#docs",
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step tutorials",
    icon: Video,
    href: "#videos",
  },
  {
    title: "API Reference",
    description: "Technical documentation for developers",
    icon: FileText,
    href: "#api",
  },
  {
    title: "Contact Support",
    description: "Get help from our team",
    icon: MessageCircle,
    href: "#support",
  },
];

const faqs = [
  {
    q: "What is $TIMEOE?",
    a: "TIMEOE is an AI system that embodies time as the father of AI, providing advanced temporal manipulation, prediction, and causal analysis capabilities.",
  },
  {
    q: "How do I upload my data?",
    a: "Navigate to the Upload Data page and drag and drop your CSV, JSON, or Excel files. Ensure your data has timestamps in the first column.",
  },
  {
    q: "What is causality detection?",
    a: "Causality detection identifies true cause-and-effect relationships between variables, distinguishing them from mere correlations using statistical methods like Granger causality.",
  },
  {
    q: "How does counterfactual simulation work?",
    a: "Counterfactual simulation allows you to explore what-if scenarios by modifying variables and simulating alternative timelines to estimate treatment effects.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Help Center</h1>
            <p className="text-muted-foreground">
              Find answers and learn how to get the most out of $TIMEOE.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {helpSections.map((section, i) => (
              <Link
                key={i}
                href={section.href}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-1">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </Link>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <h3 className="font-medium text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

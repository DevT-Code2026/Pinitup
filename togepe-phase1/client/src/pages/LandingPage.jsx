import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bookmark,
  Compass,
  Share2,
  ArrowRight,
  ChevronDown,
  Check,
  Zap,
  Shield,
  Image,
  Wand2,
  FolderKanban,
  Users,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./LandingPage.css";

const features = [
  {
    icon: Bookmark,
    title: "Save Prompts",
    description:
      "Bookmark your favorite AI prompts and organize them into custom boards. Never lose a great prompt again.",
    color: "#4f46e5",
    bg: "#eef2ff",
  },
  {
    icon: Compass,
    title: "Discover",
    description:
      "Explore a curated library of community-shared prompts. Search by category, popularity, or recency.",
    color: "#7c3aed",
    bg: "#f3e8ff",
  },
  {
    icon: Share2,
    title: "Share",
    description:
      "Share your best prompts with the world. One click to copy or share via any platform.",
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    icon: Wand2,
    title: "AI-Powered",
    description:
      "Leverage AI-generated prompts for ChatGPT, Midjourney, Stable Diffusion, and more.",
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    icon: FolderKanban,
    title: "Organize",
    description:
      "Create boards for different projects, clients, or use cases. Keep your workflow structured.",
    color: "#dc2626",
    bg: "#fef2f2",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Join a growing community of AI enthusiasts. Like, save, and get inspired by others.",
    color: "#0891b2",
    bg: "#ecfeff",
  },
];

const categories = [
  { name: "ChatGPT", icon: "💬", count: "2.4k prompts" },
  { name: "Midjourney", icon: "🎨", count: "1.8k prompts" },
  { name: "Stable Diffusion", icon: "🖼️", count: "1.2k prompts" },
  { name: "DALL-E", icon: "✨", count: "980 prompts" },
  { name: "Coding", icon: "💻", count: "3.1k prompts" },
  { name: "Writing", icon: "✍️", count: "1.5k prompts" },
  { name: "Marketing", icon: "📈", count: "870 prompts" },
  { name: "Business", icon: "💼", count: "640 prompts" },
];

const steps = [
  {
    step: "01",
    title: "Discover",
    description:
      "Browse our curated library of AI prompts or search for exactly what you need.",
    icon: Compass,
  },
  {
    step: "02",
    title: "Save",
    description:
      "One-click save any prompt to your personal boards. Organize by project or topic.",
    icon: Bookmark,
  },
  {
    step: "03",
    title: "Use",
    description:
      "Copy the prompt with one click and paste it into your favorite AI tool.",
    icon: Zap,
  },
  {
    step: "04",
    title: "Share",
    description:
      "Share your best prompts with the community and help others discover great content.",
    icon: Share2,
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with AI prompts.",
    features: [
      "Save up to 50 prompts",
      "3 personal boards",
      "Basic search & filters",
      "Community access",
      "Copy & share prompts",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For power users who need unlimited access.",
    features: [
      "Unlimited prompt saves",
      "Unlimited boards",
      "Advanced search & AI filters",
      "Priority community support",
      "Custom categories & tags",
      "Export collections",
      "Early access to new features",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
];

const faqs = [
  {
    question: "What is PromptPin?",
    answer:
      "PromptPin is a Pinterest-inspired platform for discovering, saving, and sharing AI prompts. Think of it as your personal prompt library — organized, searchable, and always accessible.",
  },
  {
    question: "Is PromptPin free to use?",
    answer:
      "Yes! PromptPin offers a generous free tier that lets you save up to 50 prompts and create 3 boards. For unlimited access, our Pro plan is just $9/month.",
  },
  {
    question: "What AI tools are supported?",
    answer:
      "PromptPin supports prompts for all major AI tools including ChatGPT, Midjourney, Stable Diffusion, DALL-E, Claude, Gemini, and more. Our community shares prompts for virtually every AI platform.",
  },
  {
    question: "Can I share my own prompts?",
    answer:
      "Absolutely! You can upload and share your prompts with the community. Help others discover great prompts and build your reputation as a prompt engineer.",
  },
  {
    question: "How do boards work?",
    answer:
      "Boards are like folders for your prompts. Create boards for different projects, clients, or topics. You can save prompts to multiple boards and organize them however you like.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "PromptPin is fully responsive and works great on mobile browsers. A native mobile app is on our roadmap for future development.",
  },
];

const masonryItems = [
  { title: "Creative Writing", color: "#7c3aed", height: 180 },
  { title: "Code Generation", color: "#4f46e5", height: 240 },
  { title: "Image Prompts", color: "#dc2626", height: 200 },
  { title: "Business Copy", color: "#059669", height: 160 },
  { title: "Marketing", color: "#d97706", height: 220 },
  { title: "Data Analysis", color: "#0891b2", height: 190 },
  { title: "Email Templates", color: "#7c3aed", height: 170 },
  { title: "Social Media", color: "#4f46e5", height: 210 },
  { title: "Research", color: "#dc2626", height: 185 },
  { title: "Education", color: "#059669", height: 230 },
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`lp-faq-item ${open ? "lp-faq-item--open" : ""}`}>
      <button
        className="lp-faq-question"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown
          size={20}
          className={`lp-faq-chevron ${open ? "lp-faq-chevron--open" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="lp-faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="lp">
      {/* ========== NAVBAR ========== */}
      <header className="lp-nav">
        <div className="lp-nav__inner">
          <Link to="/" className="lp-nav__brand">
            <div className="lp-nav__logo">
              <Sparkles size={18} color="white" />
            </div>
            <span className="lp-nav__name">PromptPin</span>
          </Link>

          <nav className="lp-nav__links">
            <a href="#features" className="lp-nav__link">
              Features
            </a>
            <a href="#categories" className="lp-nav__link">
              Categories
            </a>
            <a href="#pricing" className="lp-nav__link">
              Pricing
            </a>
            <a href="#faq" className="lp-nav__link">
              FAQ
            </a>
          </nav>

          <div className="lp-nav__actions">
            <Link to="/login" className="lp-nav__login">
              Log in
            </Link>
            <Link to="/login" className="lp-nav__cta">
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="lp-hero">
        <div className="lp-hero__bg">
          <div className="lp-hero__orb lp-hero__orb--1" />
          <div className="lp-hero__orb lp-hero__orb--2" />
          <div className="lp-hero__grid" />
        </div>

        <div className="lp-hero__content">
          <motion.div
            className="lp-hero__badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Zap size={14} />
            <span>Your AI Prompt Library</span>
          </motion.div>

          <motion.h1
            className="lp-hero__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Save, discover & share
            <br />
            <span className="lp-hero__title-accent">the best AI prompts</span>
          </motion.h1>

          <motion.p
            className="lp-hero__subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            PromptPin is the Pinterest for AI prompts. Organize your collection,
            explore community-curated prompts, and never lose a great prompt
            again.
          </motion.p>

          <motion.div
            className="lp-hero__actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/login" className="lp-btn lp-btn--primary lp-btn--lg">
              Start for Free
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className="lp-btn lp-btn--ghost lp-btn--lg">
              See How It Works
            </a>
          </motion.div>

          <motion.div
            className="lp-hero__stats"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="lp-hero__stat">
              <span className="lp-hero__stat-value">10k+</span>
              <span className="lp-hero__stat-label">Prompts Saved</span>
            </div>
            <div className="lp-hero__stat-divider" />
            <div className="lp-hero__stat">
              <span className="lp-hero__stat-value">2k+</span>
              <span className="lp-hero__stat-label">Active Users</span>
            </div>
            <div className="lp-hero__stat-divider" />
            <div className="lp-hero__stat">
              <span className="lp-hero__stat-value">50+</span>
              <span className="lp-hero__stat-label">Categories</span>
            </div>
          </motion.div>
        </div>

        {/* Masonry Preview */}
        <motion.div
          className="lp-hero__masonry"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="lp-masonry">
            {masonryItems.map((item, i) => (
              <div
                key={i}
                className="lp-masonry__item"
                style={{
                  height: item.height,
                  background: `linear-gradient(135deg, ${item.color}22, ${item.color}44)`,
                  borderColor: `${item.color}33`,
                }}
              >
                <span
                  className="lp-masonry__label"
                  style={{ color: item.color }}
                >
                  {item.title}
                </span>
                <div
                  className="lp-masonry__dots"
                  style={{ color: item.color }}
                >
                  ···
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="lp-section lp-features">
        <div className="lp-section__inner">
          <motion.div
            className="lp-section__header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="lp-section__badge">Features</span>
            <h2 className="lp-section__title">
              Everything you need to master AI prompts
            </h2>
            <p className="lp-section__subtitle">
              From saving your first prompt to building an entire collection —
              PromptPin has you covered.
            </p>
          </motion.div>

          <div className="lp-features__grid">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="lp-feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08 }}
              >
                <div
                  className="lp-feature-card__icon"
                  style={{ background: feature.bg, color: feature.color }}
                >
                  <feature.icon size={24} />
                </div>
                <h3 className="lp-feature-card__title">{feature.title}</h3>
                <p className="lp-feature-card__desc">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES ========== */}
      <section id="categories" className="lp-section lp-categories">
        <div className="lp-section__inner">
          <motion.div
            className="lp-section__header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="lp-section__badge">Categories</span>
            <h2 className="lp-section__title">
              Explore prompts across every category
            </h2>
            <p className="lp-section__subtitle">
              From creative writing to code generation — find the perfect prompt
              for any use case.
            </p>
          </motion.div>

          <div className="lp-categories__scroll">
            <div className="lp-categories__track">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  className="lp-category-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.06 }}
                >
                  <span className="lp-category-card__icon">{cat.icon}</span>
                  <h3 className="lp-category-card__name">{cat.name}</h3>
                  <span className="lp-category-card__count">{cat.count}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== WORKFLOW ========== */}
      <section className="lp-section lp-workflow">
        <div className="lp-section__inner">
          <motion.div
            className="lp-section__header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="lp-section__badge">How It Works</span>
            <h2 className="lp-section__title">
              Four steps to prompt mastery
            </h2>
            <p className="lp-section__subtitle">
              Getting started is simple. Discover, save, use, and share — all in
              a few clicks.
            </p>
          </motion.div>

          <div className="lp-steps">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                className="lp-step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="lp-step__number">{step.step}</div>
                <div className="lp-step__icon">
                  <step.icon size={28} />
                </div>
                <h3 className="lp-step__title">{step.title}</h3>
                <p className="lp-step__desc">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="lp-step__connector" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section id="pricing" className="lp-section lp-pricing">
        <div className="lp-section__inner">
          <motion.div
            className="lp-section__header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="lp-section__badge">Pricing</span>
            <h2 className="lp-section__title">Simple, transparent pricing</h2>
            <p className="lp-section__subtitle">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </motion.div>

          <div className="lp-pricing__grid">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`lp-pricing-card ${
                  plan.highlighted ? "lp-pricing-card--highlighted" : ""
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1 }}
              >
                {plan.highlighted && (
                  <div className="lp-pricing-card__badge">
                    <Star size={14} />
                    Most Popular
                  </div>
                )}
                <h3 className="lp-pricing-card__name">{plan.name}</h3>
                <div className="lp-pricing-card__price">
                  <span className="lp-pricing-card__amount">{plan.price}</span>
                  <span className="lp-pricing-card__period">{plan.period}</span>
                </div>
                <p className="lp-pricing-card__desc">{plan.description}</p>
                <ul className="lp-pricing-card__features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={16} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className={`lp-btn ${
                    plan.highlighted ? "lp-btn--primary" : "lp-btn--outline"
                  } lp-btn--full`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section id="faq" className="lp-section lp-faq">
        <div className="lp-section__inner">
          <motion.div
            className="lp-section__header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="lp-section__badge">FAQ</span>
            <h2 className="lp-section__title">Frequently asked questions</h2>
            <p className="lp-section__subtitle">
              Everything you need to know about PromptPin.
            </p>
          </motion.div>

          <div className="lp-faq__list">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="lp-section lp-cta-section">
        <div className="lp-section__inner">
          <motion.div
            className="lp-cta-block"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <h2 className="lp-cta-block__title">
              Ready to level up your AI game?
            </h2>
            <p className="lp-cta-block__desc">
              Join thousands of users who are already using PromptPin to
              organize, discover, and share the best AI prompts.
            </p>
            <div className="lp-cta-block__actions">
              <Link
                to="/login"
                className="lp-btn lp-btn--white lp-btn--lg"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__top">
            <div className="lp-footer__brand">
              <Link to="/" className="lp-footer__logo">
                <div className="lp-nav__logo">
                  <Sparkles size={18} color="white" />
                </div>
                <span className="lp-nav__name">PromptPin</span>
              </Link>
              <p className="lp-footer__tagline">
                The Pinterest for AI prompts. Save, discover, and share the best
                prompts for ChatGPT, Midjourney, and more.
              </p>
            </div>

            <div className="lp-footer__links">
              <div className="lp-footer__col">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#categories">Categories</a>
                <a href="#faq">FAQ</a>
              </div>
              <div className="lp-footer__col">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
              </div>
              <div className="lp-footer__col">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>

          <div className="lp-footer__bottom">
            <span>
              © {new Date().getFullYear()} PromptPin. All rights reserved.
            </span>
            <div className="lp-footer__socials">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="GitHub">GH</a>
              <a href="#" aria-label="Discord">DC</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

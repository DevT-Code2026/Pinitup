// Seed example workflows — idempotent, safe to run multiple times.
//   node seedWorkflows.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import Workflow from "./models/Workflow.js";

dotenv.config();

const SEED_WORKFLOWS = [
  {
    name: "Image Generation",
    slug: "image-generation",
    description: "Generate high-quality images from text prompts using advanced AI models.",
    provider: "gemini",
    creditCost: 75,
    status: "active",
  },
  {
    name: "Prompt Enhancement",
    slug: "prompt-enhancement",
    description: "Improve and refine your AI prompts for better results across any model.",
    provider: "gemini",
    creditCost: 10,
    status: "active",
  },
  {
    name: "Caption Generator",
    slug: "caption-generator",
    description: "Create engaging captions for social media posts, blogs, and content.",
    provider: "openai",
    creditCost: 15,
    status: "active",
  },
  {
    name: "SEO Generator",
    slug: "seo-generator",
    description: "Generate SEO-optimized titles, descriptions, and meta content for your pages.",
    provider: "openai",
    creditCost: 20,
    status: "active",
  },
  {
    name: "Blog Writer",
    slug: "blog-writer",
    description: "Write complete blog posts and articles with structured outlines and engaging content.",
    provider: "claude",
    creditCost: 40,
    status: "active",
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let created = 0;
  let skipped = 0;

  for (const workflow of SEED_WORKFLOWS) {
    const existing = await Workflow.findOne({ slug: workflow.slug });
    if (existing) {
      skipped++;
    } else {
      await Workflow.create(workflow);
      created++;
    }
  }

  console.log(`Workflows seeded: ${created} created, ${skipped} already existed`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

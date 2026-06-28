import mongoose, { Schema } from "mongoose";

const linkSchema = new Schema(
  {
    label: String,
    url: String,
  },
  { _id: false },
);

const portfolioSchema = new Schema(
  {
    profile: {
      name: String,
      role: String,
      location: String,
      phone: String,
      email: String,
      headline: String,
      summary: String,
      about: String,
      resumeUrl: String,
      github: String,
      linkedin: String,
      leetcode: String,
    },
    stats: [{ value: String, label: String }],
    stack: [String],
    skills: [{ title: String, items: [String] }],
    experience: [
      {
        role: String,
        company: String,
        period: String,
        location: String,
        bullets: [String],
      },
    ],
    projects: [
      {
        title: String,
        slug: String,
        year: String,
        summary: String,
        body: String,
        imageUrl: String,
        stack: [String],
        highlights: [String],
        links: [linkSchema],
        metaTitle: String,
        metaDescription: String,
      },
    ],
    education: [
      {
        title: String,
        institution: String,
        period: String,
        detail: String,
      },
    ],
    blogs: [
      {
        title: String,
        date: String,
        excerpt: String,
        slug: String,
        body: String,
        coverImage: String,
        metaTitle: String,
        metaDescription: String,
        published: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true, minimize: false },
);

export const Portfolio = mongoose.model("Portfolio", portfolioSchema);

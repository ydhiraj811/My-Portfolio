export const defaultContent = {
  profile: {
    name: "Dhiraj Kumar Yadav",
    role: "Software Engineer",
    location: "New Delhi, India",
    phone: "+91-9852224072",
    email: "ydhiraj811@gmail.com",
    headline: "Backend APIs, cloud services, and monitoring systems that hold up in production.",
    summary:
      "Software Engineer with experience building backend APIs in Python and Node.js, AWS cloud services, and distributed monitoring systems. Technical lead for a 7-person test automation team, with production ownership from API design through deployment.",
    about:
      "I work close to the parts of a product where reliability, data flow, and user impact meet. My recent work includes Python APIs, automation frameworks, REST validation suites, and operational tooling for enterprise monitoring systems. I am especially interested in scalable infrastructure, distributed systems, and clean engineering habits that make teams faster without making systems fragile.",
    resumeUrl: "/assets/resume.pdf",
    github: "https://github.com/ydhiraj811",
    linkedin: "https://www.linkedin.com/in/ydhiraj811",
    leetcode: "https://leetcode.com/u/ydhiraj811/",
  },
  stats: [
    { value: "10+", label: "Production API endpoints" },
    { value: "7", label: "Automation engineers led" },
    { value: "10+", label: "Design and code reviews" },
  ],
  stack: ["MongoDB", "Express.js", "React", "Node.js", "TypeScript"],
  skills: [
    { title: "Cloud & Backend", items: ["AWS Lambda", "API Gateway", "DynamoDB", "S3", "IAM", "CloudWatch", "Node.js", "Express.js", "Python", "Flask", "Django", "FastAPI", "REST API Design"] },
    { title: "Frontend", items: ["React.js", "TypeScript", "Tailwind CSS", "Responsive UI Design"] },
    { title: "Data", items: ["MongoDB", "Mongoose", "Schema Design", "CRUD Operations"] },
    { title: "Core Engineering", items: ["Data Structures", "Algorithms", "System Design", "JavaScript", "Java", "Git"] },
    { title: "Engineering Practice", items: ["Test Automation", "CI/CD", "Code Review", "Root-Cause Debugging", "Technical Leadership"] },
    { title: "Product Habits", items: ["API ownership", "Production debugging", "Documentation", "Cross-team collaboration"] },
  ],
  experience: [
    {
      role: "Software Engineer",
      company: "Tata Consultancy Services",
      period: "August 2024 - Present",
      location: "New Delhi, India",
      bullets: [
        "Built and own 10+ REST API endpoints in Python for client platform data-serving, transformation, and third-party integrations.",
        "Designed and shipped a new user-facing feature end-to-end, from API design through production deployment.",
        "Identified and resolved a production Python service reliability issue before it impacted customers.",
        "Serve as technical lead for a 7-person test automation team, assigning work, reviewing scripts, and setting technical direction.",
        "Built reusable UI components and backend services that improved operational visibility across staging and production monitoring systems.",
        "Integrated authentication and authorization mechanisms across REST APIs with security engineering teams.",
      ],
    },
  ],
  projects: [
    {
      title: "Developer Portfolio with AI Chatbot & Admin Dashboard",
      year: "Personal Project",
      summary:
        "MERN + TypeScript portfolio with dynamic blogs, project showcase, JWT-authenticated admin dashboard, MongoDB-backed content APIs, and chatbot-ready architecture.",
      stack: ["MongoDB", "Express", "React", "Node.js", "TypeScript", "JWT", "REST APIs"],
      links: [{ label: "GitHub", url: "https://github.com/ydhiraj811" }],
    },
    {
      title: "Real-Time Chat Application",
      year: "Personal Project",
      summary:
        "MERN chat app with Socket.io live messaging, online-status updates, JWT authentication, Zustand state management, and end-to-end deployment.",
      stack: ["MongoDB", "Express", "React", "Node.js", "Socket.io", "Zustand", "JWT"],
      links: [{ label: "GitHub", url: "https://github.com/ydhiraj811" }],
    },
    {
      title: "Leave On Time - Leave Management System",
      year: "2024",
      summary:
        "Leave management platform supporting role-based access control, workflow automation, backup mapping, notifications, and scalable REST APIs.",
      stack: ["React.js", "Node.js", "Express.js", "MongoDB", "RBAC", "REST APIs"],
      links: [{ label: "GitHub", url: "https://github.com/ydhiraj811" }],
    },
    {
      title: "LawSathi - Legal Advisory Platform",
      year: "2023",
      summary:
        "Full-stack legal advisory platform with chatbot-based advisory workflows, CRUD operations, and access controls across multiple resource types.",
      stack: ["React.js", "Node.js", "Express.js", "MongoDB", "Chatbot"],
      links: [{ label: "GitHub", url: "https://github.com/ydhiraj811" }],
    },
  ],
  education: [
    {
      title: "Bachelor of Computer Applications",
      institution: "Guru Gobind Singh Indraprastha University, New Delhi",
      period: "May 2024",
      detail: "CGPA: 8.45/10",
    },
    {
      title: "AWS Certified Developer - Associate",
      institution: "Amazon Web Services",
      period: "September 2025",
      detail: "Cloud development certification focused on AWS developer services.",
    },
  ],
  blogs: [
    {
      title: "What I learned owning production APIs early",
      date: "Engineering Notes",
      slug: "owning-production-apis",
      excerpt:
        "API ownership is not only about routes and payloads. It is about debugging habits, observability, and knowing what failure looks like before customers do.",
      body: "Draft post managed from the admin dashboard.",
      published: true,
    },
    {
      title: "How automation leadership changed my engineering taste",
      date: "Team Practice",
      slug: "automation-leadership",
      excerpt:
        "Leading automation work sharpened the value of readable test code, repeatable decisions, and feedback loops that help teams ship with less drag.",
      body: "Draft post managed from the admin dashboard.",
      published: true,
    },
    {
      title: "Why distributed monitoring feels like product work",
      date: "Systems",
      slug: "distributed-monitoring-product-work",
      excerpt:
        "Monitoring tools become useful when they translate technical signals into decisions people can make quickly across staging and production.",
      body: "Draft post managed from the admin dashboard.",
      published: true,
    },
  ],
};

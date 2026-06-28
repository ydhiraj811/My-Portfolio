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
      slug: "developer-portfolio-ai-admin-dashboard",
      year: "Personal Project",
      summary:
        "MERN + TypeScript portfolio with dynamic blogs, project showcase, JWT-authenticated admin dashboard, MongoDB-backed content APIs, and chatbot-ready architecture.",
      body:
        "This portfolio is designed as a real product surface, not a static resume page. The backend owns portfolio data in MongoDB, exposes protected APIs for admin updates, and keeps public rendering separate from editing workflows.\n\nThe admin dashboard supports field-based editing for profile content, skills, projects, blogs, and experience. The public side focuses on fast scanning, clear credibility signals, and detailed pages for deeper project reading.",
      imageUrl: "/assets/hero-workspace.png",
      stack: ["MongoDB", "Express", "React", "Node.js", "TypeScript", "JWT", "REST APIs"],
      highlights: ["JWT-protected admin dashboard", "MongoDB-backed dynamic content", "Dedicated project and blog pages", "Live coding consistency calendars"],
      links: [{ label: "GitHub", url: "https://github.com/ydhiraj811" }],
      metaTitle: "MERN TypeScript Portfolio Project",
      metaDescription: "A MongoDB-backed developer portfolio with React, Node.js, Express, TypeScript, JWT auth, admin editing, blogs, and project pages.",
    },
    {
      title: "Real-Time Chat Application",
      slug: "real-time-chat-application",
      year: "Personal Project",
      summary:
        "MERN chat app with Socket.io live messaging, online-status updates, JWT authentication, Zustand state management, and end-to-end deployment.",
      body:
        "A full-stack chat application built to practice real-time product flows: authentication, protected conversations, live message delivery, and visible online state.\n\nThe application focuses on clean client state management and resilient user feedback for loading, error, and connection states.",
      imageUrl: "/assets/hero-workspace.png",
      stack: ["MongoDB", "Express", "React", "Node.js", "Socket.io", "Zustand", "JWT"],
      highlights: ["Socket.io live messaging", "JWT authentication", "Online user status", "Frontend state management with Zustand"],
      links: [{ label: "GitHub", url: "https://github.com/ydhiraj811" }],
      metaTitle: "Real-Time Chat Application",
      metaDescription: "A MERN real-time chat application with Socket.io, JWT authentication, Zustand, and live online-status updates.",
    },
    {
      title: "Leave On Time - Leave Management System",
      slug: "leave-on-time-management-system",
      year: "2024",
      summary:
        "Leave management platform supporting role-based access control, workflow automation, backup mapping, notifications, and scalable REST APIs.",
      body:
        "Leave On Time was built around operational clarity: employees can apply for leave, managers can review requests, and teams can understand backup and approval flows without manual follow-up.\n\nThe project includes role-based access control, reusable UI modules, and API design for workflows such as approvals, notifications, and skill mapping.",
      imageUrl: "/assets/hero-workspace.png",
      stack: ["React.js", "Node.js", "Express.js", "MongoDB", "RBAC", "REST APIs"],
      highlights: ["Role-based leave workflows", "Approval and notification modules", "MongoDB schema design", "Reusable React UI components"],
      links: [{ label: "GitHub", url: "https://github.com/ydhiraj811" }],
      metaTitle: "Leave On Time Management System",
      metaDescription: "A full-stack leave management system with React, Node.js, Express, MongoDB, RBAC, approvals, and workflow automation.",
    },
    {
      title: "LawSathi - Legal Advisory Platform",
      slug: "lawsathi-legal-advisory-platform",
      year: "2023",
      summary:
        "Full-stack legal advisory platform with chatbot-based advisory workflows, CRUD operations, and access controls across multiple resource types.",
      body:
        "LawSathi explores how a legal advisory product can guide users through structured questions, resource management, and controlled access to legal information.\n\nThe project combines full-stack CRUD workflows with chatbot-style interaction patterns and role-aware resource access.",
      imageUrl: "/assets/hero-workspace.png",
      stack: ["React.js", "Node.js", "Express.js", "MongoDB", "Chatbot"],
      highlights: ["Chatbot-based advisory flow", "CRUD across multiple resources", "Access-controlled data views", "Full-stack MERN implementation"],
      links: [{ label: "GitHub", url: "https://github.com/ydhiraj811" }],
      metaTitle: "LawSathi Legal Advisory Platform",
      metaDescription: "A MERN legal advisory platform with chatbot workflows, CRUD resource management, and access controls.",
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
      body:
        "Owning APIs early taught me that backend work becomes real when someone depends on it in production.\n\nThe useful habits are simple but demanding: understand payload contracts, log the right failure points, review edge cases before deployment, and keep enough operational context to debug quickly when something changes.\n\nThe biggest lesson is that API quality is not only measured by whether a route returns data. It is measured by how calmly the system behaves when inputs, downstream services, or traffic patterns are imperfect.",
      coverImage: "/assets/hero-workspace.png",
      metaTitle: "What I Learned Owning Production APIs Early",
      metaDescription: "Notes on backend API ownership, observability, debugging, and production reliability from early software engineering work.",
      published: true,
    },
    {
      title: "How automation leadership changed my engineering taste",
      date: "Team Practice",
      slug: "automation-leadership",
      excerpt:
        "Leading automation work sharpened the value of readable test code, repeatable decisions, and feedback loops that help teams ship with less drag.",
      body:
        "Automation leadership changes how you look at engineering quality. A flaky test or unclear script does not stay small when a team relies on it every day.\n\nThe work pushed me toward readable automation, review habits, and simple conventions that help people move faster. Good automation should reduce doubt, not create another layer of confusion.\n\nThe best feedback loops are the ones engineers actually trust enough to use before production.",
      coverImage: "/assets/hero-workspace.png",
      metaTitle: "How Automation Leadership Changed My Engineering Taste",
      metaDescription: "Reflections on test automation leadership, readable scripts, reliable feedback loops, and team engineering quality.",
      published: true,
    },
    {
      title: "Why distributed monitoring feels like product work",
      date: "Systems",
      slug: "distributed-monitoring-product-work",
      excerpt:
        "Monitoring tools become useful when they translate technical signals into decisions people can make quickly across staging and production.",
      body:
        "Distributed monitoring becomes product work when the dashboard starts shaping decisions. It is not enough to show technical signals; the interface has to help people understand what changed, where to look, and how urgent the issue is.\n\nWorking around monitoring systems made me appreciate the connection between backend services, UI clarity, and operational confidence.\n\nThe better the visibility, the easier it is for teams to act before small issues become customer-facing problems.",
      coverImage: "/assets/hero-workspace.png",
      metaTitle: "Why Distributed Monitoring Feels Like Product Work",
      metaDescription: "A systems note on distributed monitoring, operational visibility, and turning technical signals into product decisions.",
      published: true,
    },
  ],
};

# 🧩 Cube Buddy – Puzzle Solver

Cube Buddy is a modern, web-based **twisty puzzle solver** that helps users understand and solve Rubik’s Cube–style puzzles **step by step** with clear move explanations and an intuitive user interface.

🔗 **Live Demo:** https://cube-buddy.vercel.app/

---

## 🚀 Features

- 🔹 Supports multiple cube types (2×2, 3×3, 4×4, 5×5, etc.)
- 🔹 Step-by-step solution navigation
- 🔹 Beginner-friendly move explanations (R, U, F, etc.)
- 🔹 Clean and responsive UI (desktop & mobile)
- 🔹 Fast and optimized performance
- 🔹 Deployed on Vercel

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Package Manager:** npm
- **Node Version:** 24.x

---

## 📂 Project Structure
~~~
cube-buddy/
│
├── app/
│   ├── layout.tsx                 # Root layout (fonts, analytics, global UI)
│   ├── page.tsx                   # Home page
│   │
│   ├── solver/
│   │   ├── page.tsx               # Solver selection page
│   │   │
│   │   └── solution/
│   │       ├── page.tsx           # Server component (Suspense wrapper)
│   │       └── SolutionClient.tsx # Client component (step-by-step logic)
│
├── public/
│   ├── 2x2-rubiks-cube.jpg         # 2×2 cube image
│   ├── 3x3-rubiks-cube.jpg         # 3×3 cube image
│   ├── 4x4-rubiks-cube.jpg         # 4×4 cube image
│   ├── 5x5-rubiks-cube.jpg         # 5×5 cube image
│   ├── icon.svg                   # App icon
│   ├── icon-light-32x32.png        # Light theme favicon
│   ├── icon-dark-32x32.png         # Dark theme favicon
│   ├── apple-icon.png              # Apple touch icon
│   └── favicon.ico                 # Browser favicon
│
├── components/
│   └── background-paths.tsx        # Decorative background component
│
├── styles/
│   └── globals.css                 # Global styles (Tailwind base)
│
├── .gitignore                      # Git ignored files
├── .npmrc                          # npm registry configuration
├── .nvmrc                          # Node version configuration
├── next-env.d.ts                   # Next.js TypeScript types
├── next.config.js                  # Next.js configuration
├── package.json                    # Project metadata & dependencies
├── package-lock.json               # npm lock file
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── README.md                       # Project documentation
│
└── node_modules/                 # Dependencies (not committed)

The project follows the Next.js 14 App Router architecture with proper separation of server and client components.
~~~
---
## 🧠 What I Learned
Handling client/server components in Next.js App Router
Fixing useSearchParams with Suspense boundaries
Real-world deployment debugging on Vercel
Managing Node.js version compatibility
Handling static assets correctly without Git LFS

## 🌐 Deployment
The application is deployed using Vercel.

🔗 Live URL: https://cube-buddy.vercel.app/

## Acknowledgements

Inspired by twisty puzzle communities and Rubik’s Cube solvers
Thanks to Next.js and Vercel documentation

## Contact

Kesavaraja M

📧 LinkedIn: (https://www.linkedin.com/in/kesavaraja-m/)

🌐 GitHub: https://github.com/Kesavaraja67

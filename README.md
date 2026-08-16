# 📝 E-Blogging App (Built with TypeScript)

<p align="center">
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
</p>

## 📌 Overview

This is a full-stack **E-Blogging web application** built using **TypeScript**. It allows users to create, edit, and delete blog posts, manage user authentication, and interact with other bloggers through a modern, responsive interface.

Whether you're a tech enthusiast, content creator, or developer, this app offers a solid platform for learning and collaboration.

---

## 🚀 Features

- 🧑‍💻 User Registration & Login (JWT Auth)
- 📝 Create, Edit, and Delete Blog Posts
- 🔐 Authenticated Routes with Token Protection
- 🌐 RESTful APIs for communication between front-end and back-end
- 📦 MongoDB Database Integration
- 🔍 Real-time Post Updates
- 🎨 Responsive UI with Modern Component Library
- 🌙 Dark Mode Support
- 📊 Data Visualization
- 🎯 Advanced Form Handling with Validation

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type safety for both front & back |
| **React 18** | Frontend UI Framework |
| **Vite** | Fast build tool and dev server |
| **TailwindCSS** | Utility-first styling |
| **shadcn/ui** | High-quality React components |
| **React Router** | Client-side routing |
| **React Query (TanStack)** | Server state management |
| **React Hook Form** | Efficient form management |
| **Zod** | TypeScript-first schema validation |
| **Node.js** | Backend runtime |
| **Express.js** | API server & routing |
| **MongoDB** | NoSQL Database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication & Authorization |

---

## 📁 Project Structure

```
├── backend/             # Node.js/Express Backend API
│   ├── index.js         # Main server file
│   └── package.json     # Backend dependencies
├── src/                 # Frontend React application
│   ├── components/      # Reusable React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services
│   ├── lib/             # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── App.tsx          # Main app component
├── public/              # Static assets
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # TailwindCSS configuration
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account

### Steps

1. **Clone the repository:**
```bash
git clone https://github.com/Samarssj/eBlogging-webapp.git
cd eBlogging-webapp
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Install backend dependencies:**
```bash
cd backend
npm install
cd ..
```

4. **Configure environment variables:**
Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

5. **Start the development server:**
```bash
npm run dev
```

---

## 📜 Available Scripts

- `npm run dev` - Start the frontend development server
- `npm run build` - Create optimized production build
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Blogging! 🚀**

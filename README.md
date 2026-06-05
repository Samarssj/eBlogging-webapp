# 📝 E-Blogging App (Built with TypeScript)

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
- 🔍 Real-time Post Updates (optional via WebSockets)
- 🎨 Responsive UI with Modern Component Library
- 🌙 Dark Mode Support (Next Themes)
- 📊 Data Visualization (Recharts)
- 🎯 Advanced Form Handling with Validation

---

## 🛠️ Tech Stack

| Technology     | Purpose                          |
|----------------|----------------------------------|
| **TypeScript** | Type safety for both front & back |
| **React 18** | Frontend UI Framework |
| **Vite** | Fast build tool and dev server |
| **TailwindCSS** | Utility-first styling |
| **shadcn/ui** | High-quality React components |
| **React Router** | Client-side routing |
| **React Query (TanStack)** | Server state management |
| **React Hook Form** | Efficient form management |
| **Zod** | TypeScript-first schema validation |
| **Recharts** | Interactive data visualization |
| **Node.js** | Backend runtime |
| **Express.js** | API server & routing |
| **MongoDB** | NoSQL Database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication & Authorization |

---

## 📁 Project Structure

```
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services
│   ├── lib/             # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Global CSS
│   └── App.tsx          # Main app component
├── public/              # Static assets
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # TailwindCSS configuration
└── eslint.config.js     # ESLint rules
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud Atlas)

### Steps

1. **Clone the repository:**
```bash
git clone https://github.com/Samarssj/eBlogging-webapp.git
cd eBlogging-webapp
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env.local` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_JWT_TOKEN_KEY=your_jwt_secret_here
```

4. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📜 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Create optimized production build
- `npm run build:dev` - Build with development settings
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

---

## 🔑 Key Features in Detail

### Authentication
- JWT-based authentication system
- Secure token storage with HTTP-only cookies
- Protected routes for authenticated users
- User session management

### Blog Management
- Rich text editor for blog posts
- Create, read, update, and delete (CRUD) operations
- Draft and publish functionality
- Post categories and tagging
- Search and filter capabilities

### UI/UX
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Mode** - Toggle between light and dark themes
- **Component Library** - Pre-built components from shadcn/ui
- **Form Validation** - Real-time validation with Zod and React Hook Form
- **Toast Notifications** - User feedback via Sonner

### State Management
- React Query for server-side data caching
- Local state management with React hooks
- Optimized re-renders and performance

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload the `dist` folder to Netlify
```

### Environment Variables for Production
Update your hosting platform with:
```env
VITE_API_BASE_URL=https://your-api.com
VITE_JWT_TOKEN_KEY=production_secret
```

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

## 💬 Support & Feedback

If you have any questions or feedback, feel free to:
- Open an issue on GitHub
- Contact the maintainers
- Check existing documentation

---

## 🙏 Acknowledgments

- **shadcn/ui** for the amazing component library
- **TailwindCSS** for utility-first CSS
- **React Team** for the amazing framework
- All contributors and supporters of this project

---

**Happy Blogging! 🚀**

# Chat-App (Instagram style chatting app)

This is a full-stack real-time chat application where users can:
- Register / Login (Authentication with JWT)
- Search and follow users (like Instagram follow system)
- Accept / Reject follow requests
- Send & receive messages in real-time (Socket.io)
- Story upload feature (like Instagram story)
- Online / Offline status indicator
- Typing indicator
- Last seen status
- Notification system
- Cloudinary for image upload
- Status (story) expires automatically after 24 hours

---

## 🛠️ Tech Stack

### 🔹 Frontend (Mobile + Web)
- React Native (Expo)
- React Navigation
- Axios
- Socket.io Client

### 🔹 Backend (Server)
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io
- Cloudinary

---

## 🚀 How to Run Project

### ✅ 1. Clone Project
git clone <your-repo-link>
cd chatApp

yaml
Copy code

---

### ✅ 2. Install Backend Dependencies
cd Backend
npm install

yaml
Copy code

Run Backend:
nodemon Main.js

yaml
Copy code

(Backend will start on your given PORT.)

---

### ✅ 3. Install Frontend Dependencies
cd ../frontend_native
npm install

nginx
Copy code

Run frontend on **Web**:
npx expo start --web

nginx
Copy code

Run frontend on **Mobile (Android / iPhone)**:
npx expo start

yaml
Copy code

Then scan QR code with Expo Go app.

---

## 🧪 Environment Variables

Create `.env` file in both:

📁 Backend/.env  
📁 frontend_native/.env

Example:

MONGO_URI=your-uri
JWT_SECRET=your-secret
CLOUDINARY_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

yaml
Copy code

---

## 📸 Screenshots (if available)

> You can add screenshots later.

---

## 🤝 Contributing

Feel free to fork and improve the project.
Pull requests are welcome.

---

## ✨ Future Improvements

- Video calls
- Theme system (dark/light)
- Group chats
- Push notifications

---

## 📩 Contact

**Developer**: Umar  
If you want to connect → choudharyumar653@gmail.com

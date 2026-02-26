const express = require('express');
const app = express();

require('dotenv').config();
const connectDB = require('./config/db');         
const redisClient = require('./config/redis');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const User = require('./models/User');
const bcrypt = require('bcrypt');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/book', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Function to create main admin if none exists
const createMainAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: "admin" });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            await User.create({
                name: process.env.ADMIN_NAME,
                email: process.env.ADMIN_EMAILID,
                password: hashedPassword,
                squad: 1,               // default squad for admin
                batch: 1,                // default batch
                role: "admin",
            });
            console.log('Main admin created');
        }
    } catch (err) {
        console.log("Error creating admin: " + err.message);
    }
};

const initializeConnection = async () => {
    try {
        await Promise.all([redisClient.connect(), connectDB()]);

        // Ensure main admin exists
        await createMainAdmin();

        app.listen(process.env.PORT, () => {
            console.log(`Server is listening at port number ${process.env.PORT}`);
        });
    } catch (err) {
        console.log("Error: " + err.message);
    }
};

initializeConnection();
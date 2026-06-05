const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/faberlic_consultant');
        console.log('MongoDB connected...');

        const adminEmail = 'admin@faberlic.com';
        const adminPassword = 'admin123';

        const existingAdmin = await User.findOne({ email: adminEmail });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        if (existingAdmin) {
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('Admin user updated successfully');
        } else {
            const newAdmin = new User({
                name: 'Admin',
                surname: 'User',
                username: 'admin',
                email: adminEmail,
                password: hashedPassword,
                gender: 'female',
                role: 'admin'
            });
            await newAdmin.save();
            console.log('Admin user created successfully');
        }

        console.log('Admin Credentials:');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const{ connectDB} = require('./config/database.js');
const { cloudinaryConnect } = require('./config/cloudinary');
const authRoutes = require('./routes/authRoutes');


dotenv.config();


//connect to cloudinary
cloudinaryConnect();

connectDB();



const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
// app.use('/uploads', express.static('uploads'));

app.use('/api/image', require('./routes/imageRoutes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

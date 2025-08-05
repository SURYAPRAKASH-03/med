const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3011;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));

// HTML Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/hospitals', (req, res) => res.sendFile(path.join(__dirname, 'hospitals.html')));
app.get('/update', (req, res) => res.sendFile(path.join(__dirname, 'update.html')));
app.get('/information', (req, res) => res.sendFile(path.join(__dirname, 'information.html')));

// MongoDB Connection
const uri = 'mongodb+srv://suryaprakash1:prakash003@cluster0.llqz2qh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('MongoDB Atlas connection error:', err);
  });

// Schemas
const userSchema = new mongoose.Schema({
  username: String,
  blood: String,
  password: String
});
const User = mongoose.model('User', userSchema);

const hospitalSchema = new mongoose.Schema({
  id: Number,
  name: String,
  address: String,
  bloodAvailability: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});
const Hospital = mongoose.model('Hospital', hospitalSchema);

// Signin Route
app.post('/index', async (req, res) => {
  const { username, blood, password } = req.body;
  try {
    const newUser = new User({ username, blood, password });
    await newUser.save();
    res.send(`
      <script>
        alert('Signin successful!');
        window.location.href = '/login';
      </script>
    `);
  } catch (err) {
    res.status(500).send('Error signing in.');
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, blood, password } = req.body;
  try {
    const user = await User.findOne({ username, blood, password });
    if (user) {
      res.redirect('/hospitals');
    } else {
      res.send(`
        <script>
          alert('Login failed!');
          window.location.href = '/login';
        </script>
      `);
    }
  } catch (err) {
    res.status(500).send('Login error.');
  }
});

// Add Hospital Info
app.post('/information', async (req, res) => {
  const { id, name, address, bloodAvailability } = req.body;
  try {
    const newHospital = new Hospital({ id, name, address, bloodAvailability });
    await newHospital.save();
    res.send(`
      <script>
        alert('Hospital information added!');
        window.location.href = '/hospitals';
      </script>
    `);
  } catch (err) {
    res.status(500).send('Failed to save hospital info.');
  }
});

// Get All Hospitals API
app.get('/api/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hospital data" });
  }
});

// Update Blood Availability
app.put('/api/hospitals/update', async (req, res) => {
  const { id, bloodAvailability } = req.body;
  if (!id || typeof bloodAvailability !== "string") {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const updated = await Hospital.findOneAndUpdate(
      { id: Number(id) },
      { bloodAvailability },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.json({ message: "Blood availability updated", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

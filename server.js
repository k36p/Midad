const express = require("express");
const path = require("path");
const os = require('os');
const process = require('process');
const app = express();
const port = 8080;

// View engine setup
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// MongoDB and utilities
const { ObjectId } = require("mongodb");
const router = express.Router();
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Models
const User = require('./models/User'); 
const College = require('./models/CourseCollege');
const Course = require('./models/Course');
const Specializations = require('./models/CourseSpecializations')
const BookmarkModle = require('./models/Booksmark');
const Notification = require('./models/notifications');

//  Routes
const authRoutes = require('./routes/auth');
const users = require('./routes/users');
const collegeRoutes = require('./routes/colleges'); 
const specializationRoutes = require('./routes/specializations');
const mail = require('./routes/mail');
const courseRoutes = require('./routes/courses');
const notificationRoutes = require('./routes/notification'); 
const BookMark = require('./routes/bookMark');

// tools clip
const image_to_pdf = require('./routes/tools/img-to-pdf');
const pdfs_merge = require('./routes/tools/pdfs-merge');

// Database connection
const connectDB = require('./config/db');

// Connect to database
let data = connectDB();

// Middleware setup
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
const AccessPanel = require('./middlewares/access'); // Import AccessPanel middleware

// JWT authentication setup
const { type } = require("os");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const authRoute = require('./routes/auth');
const jwtUtils = require("./middlewares/jwt");
const { PassThrough } = require("stream");

app.use(cookieParser());

// Routes middleware
app.use('/auth', authRoute);
app.use(
    collegeRoutes,
    specializationRoutes,
    courseRoutes,
    mail,users,
    notificationRoutes,
    BookMark,image_to_pdf,pdfs_merge
);


// Authorization middleware
async function authorize(req, res, next) {
  try {
    // Retrieve JWT token from cookie
    const jwtToken = req.cookies.token;
    
    if (!jwtToken) {
      return res.redirect("/login");
    }
    
    // Verify JWT token
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const username = decoded.user;
    req.user = username;
    next();
    
  } catch (error) {
    console.error('Authorization error:', error);
    res.redirect("/login");
  }
}

async function verify(req, res, next) {
  try {
    delete res.locals.user; 
    const jwtToken = req.cookies.token;

    if (!jwtToken) {
      req.user = null;
      return next(); // Important: Continue to next middleware
    }
    
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // Fetch the full user data from database
    const user = await User.findById(decoded.user.id).populate({
                path: 'specialization',
                populate: {
                    path: 'college'
                }
            }).select('-password');
    
    // Attach user data to the request object
    req.user = user;
    next(); // Continue to next middleware

  } catch (error) {
    console.error('Verify error:', error);
    req.user = null;
    next(); // Always call next() even in error cases
  }
}

// Usage
app.use(verify);
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
// Then your routes

// Utility function for date formatting
function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return (
    date.getMonth() +
    1 +
    "/" +
    date.getDate() +
    "/" +
    date.getFullYear() +
    "  " +
    strTime
  );
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Routes

// Main page
app.get("/",async (req, res) => {
  try {
     res.render("main");
  } catch (error) {
    console.error('Error rendering main page:', error);
    res.status(500).send('Error loading main page');
  }
});


// Contact page
app.get("/edit", async (req, res) => {
  try {
    res.render("edit");
  } catch (error) {
    console.error('Error rendering edit page:', error);
    res.status(500).send('Error loading edit page');
  }
});

// Bookmarks page
app.get("/bookMarks", async (req, res) => {
  let dataList = []; 

  try {
    if (req.user && req.user.id) {
      dataList = await BookmarkModle.findOne({ user_id: req.user.id }).populate({
        path: 'course_id',
        populate: {
            path: 'specialization',
        }}).lean();
    }
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    dataList = []; 
  }

  try {
    res.render("saved", { dataList: dataList, });
  } catch (error) {
    console.error('Error rendering saved page:', error);
    res.status(500).send('Error loading bookmarks page');
  }
});

// Library page
app.get("/library", async (req, res) => {
  try {
    const books = await Course.find({}).populate('specialization').lean();
    res.render("library", { data: books });
  } catch (error) {
    console.error('Error loading library:', error);
    res.render("library", { data: [] });
  }
});

// Individual book page
app.get("/library/book", async (req, res) => {
  try {
    res.render("book");
  } catch (error) {
    console.error('Error rendering book page:', error);
    res.status(500).send('Error loading book page');
  }
});

// Notifications page
app.get("/notifications", async (req, res) => {
 var is_logged_in = req.user ? true : false;
 console.log(is_logged_in)
  try {
    let data_public = await Notification.find({ type: 'public' }).sort({ createdAt: -1 }).populate('specialization').lean();
    let data_by_specialization = req.user ? await Notification.find({specialization: req.user.specialization._id }).sort({ createdAt: -1 }).populate('specialization').lean() : [];
    res.render("notifications", { data: data_public, data_by_specialization: data_by_specialization, is_logged_in: is_logged_in });
  } catch (error) {
    console.error('Error rendering notifications page:', error);
    res.status(500).send('Error loading notifications page');
  }
});

// Contact page
app.get("/contact", async (req, res) => {
  try {
    res.render("contact");
  } catch (error) {
    console.error('Error rendering contact page:', error);
    res.status(500).send('Error loading contact page');
  }
});

// Login page
app.get("/login", async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.error('Error rendering login page:', error);
    res.status(500).send('Error loading login page');
  }
});

// Add college page
app.get("/new-college",AccessPanel,  async (req, res) => {
  try {
    res.render("dashboard/add-college.ejs");
  } catch (error) {
    console.error('Error rendering add college page:', error);
    res.status(500).send('Error loading add college page');
  }
});

// Add specialization page
app.get("/new-specialization",AccessPanel,  async (req, res) => {
  try {
    res.render("dashboard/add-specialization.ejs");
  } catch (error) {
    console.error('Error rendering add specialization page:', error);
    res.status(500).send('Error loading add specialization page');
  }
});

// Add books page
app.get("/new-course",AccessPanel,  async (req, res) => {
  try {
    res.render("dashboard/add-course.ejs");
  } catch (error) {
    console.error('Error rendering add books page:', error);
    res.status(500).send('Error loading add books page');
  }
});


// Add course data page
app.get("/update-content",AccessPanel, async (req, res) => {

  try {
    const courses = await Course.find({}).lean();
    res.render("dashboard/add-course-data.ejs", { data: courses });
  } catch (error) {
    console.error('Error rendering add books page:', error);
    res.status(500).send('Error loading add books page');
  }
});

// Book detail page
app.get("/book/:id", async (req, res) => { //NOTE: edit check user saved book status in soon not now but its important things for more protection
try {

  var courseId = req.params.id
  const courseData = await Course.findById(courseId).populate('specialization')
  courseData.views = courseData.views + 1; 
  await courseData.save();    


    res.render("book.ejs",{data:courseData});
  } catch (error) {
    console.error('Error rendering book detail page:', error);
    res.render('404');
  }
});


// profile page
app.get("/profile",authorize, async (req, res) => {
  try {
    res.render("profile");
  } catch (error) {
    console.error('Error rendering login page:', error);
    res.status(500).send('Error loading login page');
  }
});

// notifications page
app.get("/new-notification",AccessPanel, async (req, res) => {
  try {
    res.render("dashboard/add-notification");
  } catch (error) {
    console.error('Error rendering notification page:', error);
    res.status(500).send('Error loading notification page');
  }
});

// image to pdf page
app.get("/pdfs-merge", async (req, res) => {
  try {
    res.render("tools/pdfs-merge");
  } catch (error) {
    console.error('Error rendering edit page:', error);
    res.status(500).send('Error loading edit page');
  }
});

// pdf merge page
app.get("/images-to-pdf", async (req, res) => {
  try {
    res.render("tools/images-to-pdf");
  } catch (error) {
    console.error('Error rendering edit page:', error);
    res.status(500).send('Error loading edit page');
  }
});


// courses data dashboard page
app.get("/dash/courses",AccessPanel, async (req, res) => {
  try {
      const books = await Course.find({})
                .populate('specialization', 'name')
                .lean();
    res.render("dashboard/courses",{data : books});
  } catch (error) {
    console.error('Error rendering courses page:', error);
    res.status(500).send('Error loading courses page');
  }
});


// colleges data dashboard page
app.get("/dash/colleges",AccessPanel, async (req, res) => {
  try {
    const colleges = await College.find({});
    res.render("dashboard/colleges",{data : colleges});
  } catch (error) {
    console.error('Error rendering colleges page:', error);
    res.status(500).send('Error loading colleges page');
  }
});


// specializations data dashboard page
app.get("/dash/specializations",AccessPanel, async (req, res) => {
  try {
    const specializations = await Specializations.find({}).populate("college");
    res.render("dashboard/specializations",{data : specializations});
  } catch (error) {
    console.error('Error rendering specializations page:', error);
    res.status(500).send('Error loading specializations page');
  }
});

// admins data dashboard page
app.get("/dash/admins",AccessPanel, async (req, res) => {
  try {
    const admins = await User.find({role: 'admin'});
    res.render("dashboard/admins",{data : admins});
  } catch (error) {
    console.error('Error rendering admins page:', error);
    res.status(500).send('Error loading admins page');
  }
});

// users data dashboard page
app.get("/dash/users",AccessPanel, async (req, res) => {
  try {
    const users = await User.find({role: 'user'}).populate("specialization");
    res.render("dashboard/users",{data : users});
  } catch (error) {
    console.error('Error rendering users page:', error);
    res.status(500).send('Error loading users page');
  }
});

// notifications data dashboard page
app.get("/dash/notifications",AccessPanel, async (req, res) => {
  try {
    const notifications = await Notification.find({}).populate("specialization").sort({ createdAt: -1 });
    res.render("dashboard/notifications",{data : notifications});
  } catch (error) {
    console.error('Error rendering users page:', error);
    res.status(500).send('Error loading users page');
  }
});



// Handle 404 routes
app.use((req, res) => {
  res.render('404')
});

// Start server
app.listen( process.env.LEANCLOUD_APP_PORT, () => {
  console.log(`App listening on port ${port}`);
  console.log(`Platform: ${os.platform()}`);
  console.log(`OS Type: ${os.type()}`); 
});





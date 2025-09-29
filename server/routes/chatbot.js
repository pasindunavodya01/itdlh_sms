const express = require("express");
const fs = require("fs");
const stringSimilarity = require("string-similarity");

const router = express.Router();
const DATA_FILE = "./chatbot_data.json";

// Load JSON data with error handling
const loadData = () => {
  try {
    const rawData = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error loading data:", error);
    throw new Error("Failed to load chatbot data");
  }
};

// Save JSON data with backup
const saveData = (data) => {
  try {
    // Create backup
    const backupPath = `${DATA_FILE}.backup`;
    if (fs.existsSync(DATA_FILE)) {
      fs.copyFileSync(DATA_FILE, backupPath);
    }
    
    // Write new data
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    // Remove backup if successful
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
    
    return true;
  } catch (error) {
    // Restore backup if write failed
    const backupPath = `${DATA_FILE}.backup`;
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, DATA_FILE);
    }
    throw new Error("Failed to save data: " + error.message);
  }
};

// Define keyword mapping
const RESPONSES = {
  greeting: ["hi", "hello", "hey", "hii", "helloo", "good morning", "good afternoon", "good evening", "good night", "howdy"],
  courses: ["course", "courses", "coourses", "class", "classes", "program", "programs", "programme", "programmes", "subject", "subjects", "training", "trainings"],
  lecturers: ["lecturer", "lecturers", "teacher", "staff", "lecturrs", "professor", "instructor", "faculty", "trainer", "tutor", "mentor"],
  location: ["location", "where", "place", "address", "situated", "located", "found", "directions", "how to reach", "how to get"],
  institute: ["institute", "government", "website", "organisation", "organization", "type", "kind", "category", "nature"],
  contact: ["contact", "call", "email", "phone", "reach", "phone number", "email address", "contact details", "contact info"],
  fees: ["fee", "fees", "price", "cost", "tuition", "charges", "amount", "pay", "payment", "payments"],
  duration: ["duration", "time", "length", "weeks", "period", "months", "years", "long", "how long"],
  start_date: ["start", "starts", "starting", "date", "dates", "begin", "beginning", "commence", "when does"],
  intake: ["intake", "admission month", "admission", "apply", "join", "enroll", "enrol", "registration", "register"],
  eligibility: ["eligibility", "requirement", "requirements", "criteria", "qualifications", "needed", "prerequisite", "prerequisites", "who can"],
  description: ["description", "about course", "course info", "course details", "what is", "purpose", "overview", "summary"],
  about: ["about institute", "tell me about", "information about", "what is this place"]
};

// Chatbot message handler
router.post("/", (req, res) => {
  try {
    const userMsg = req.body.message?.toLowerCase()?.trim();
    if (!userMsg) return res.json({ reply: "Please type a message." });

    const data = loadData();

    // 1️⃣ Check if it's ONLY a greeting (no other keywords)
    const isGreeting = RESPONSES.greeting.some(k => {
      const words = userMsg.split(/\s+/);
      return words.length <= 3 && words.some(word => word === k || word.startsWith(k));
    });
    
    const hasOtherKeywords = Object.keys(RESPONSES)
      .filter(k => k !== 'greeting')
      .some(category => RESPONSES[category].some(kw => userMsg.includes(kw)));
    
    if (isGreeting && !hasOtherKeywords) {
      return res.json({ reply: data.greeting });
    }

    // 2️⃣ Fuzzy match course names
    let mentionedCourse = null;
    const courseNames = data.courses.map(c => c.name.toLowerCase());
    const courseMatch = stringSimilarity.findBestMatch(userMsg, courseNames);
    if (courseMatch.bestMatch.rating > 0.6) {
      mentionedCourse = data.courses.find(c => c.name.toLowerCase() === courseMatch.bestMatch.target);
    }

    // 3️⃣ Fuzzy match main keywords with priority and threshold
    const MIN_MATCH = 0.5; // lowered threshold for better matching
    const priorityKeys = ["location","contact","courses","lecturers","fees","duration","start_date","intake","eligibility","description","about","institute"];
    let bestMatch = null;
    let bestRating = 0;

    for (const key of priorityKeys) {
      const match = stringSimilarity.findBestMatch(userMsg, RESPONSES[key]);
      if (match.bestMatch.rating > bestRating && match.bestMatch.rating >= MIN_MATCH) {
        bestRating = match.bestMatch.rating;
        bestMatch = key;
      }
    }

    // 4️⃣ Generate response based on detected category
    if (bestMatch) {
      switch (bestMatch) {
        case "courses":
          return res.json({
            reply: "Here are our available courses:\n\n" + data.courses
              .map(
                c => `📚 ${c.name}\n  • Fee: Rs.${c.price.toLocaleString()}\n  • Duration: ${c.duration}\n  • Starts: ${c.start_date}\n  • Intake: ${c.intake_month}`
              )
              .join("\n\n")
          });

        case "lecturers":
          return res.json({
            reply: "Our experienced lecturers:\n\n" + data.lecturers.map(l => `👨‍🏫 ${l.name} - ${l.course}`).join("\n"),
          });

        case "location":
          return res.json({ 
            reply: `📍 We are located at:\n${data.location}\n\nYou can visit us at this address for more information.` 
          });

        case "institute":
          return res.json({ 
            reply: `🏛️ ${data.institute_type}\n\nWebsite: ${data.website}\n\nWe are a government-recognized institute offering quality IT and English courses.` 
          });

        case "contact":
          return res.json({ 
            reply: `📞 Contact Us:\n\n📧 Email: ${data.contact.email}\n☎️ Phone: ${data.contact.phone}\n📍 Address: ${data.contact.address}` 
          });

        case "fees":
          if (mentionedCourse) {
            return res.json({ reply: `💰 The fee for ${mentionedCourse.name} is Rs.${mentionedCourse.price.toLocaleString()}.` });
          } else {
            return res.json({ 
              reply: "💰 Course Fees:\n\n" + data.courses.map(c => ` • ${c.name}: Rs.${c.price.toLocaleString()}`).join("\n") 
            });
          }

        case "duration":
          if (mentionedCourse) {
            return res.json({ reply: `⏱️ ${mentionedCourse.name} runs for ${mentionedCourse.duration}.` });
          } else {
            return res.json({ 
              reply: "⏱️ Course Durations:\n\n" + data.courses.map(c => `${c.name}: ${c.duration}`).join("\n") 
            });
          }

        case "start_date":
          if (mentionedCourse) {
            return res.json({ reply: `📅 ${mentionedCourse.name} starts on ${mentionedCourse.start_date}.` });
          } else {
            return res.json({ 
              reply: "📅 Course Start Dates:\n\n" + data.courses.map(c => `${c.name}: ${c.start_date}`).join("\n") 
            });
          }

        case "intake":
  if (mentionedCourse) {
    return res.json({ reply: `📝 ${mentionedCourse.name} intake is in ${mentionedCourse.intake_month}.` });
  } else {
    return res.json({ 
      reply: "📝 Course Intakes:\n\n " + data.courses.map(c => `• ${c.name}: ${c.intake_month}`).join("\n") 
    });
  }

        case "eligibility":
          if (mentionedCourse) {
            return res.json({ reply: `✅ ${mentionedCourse.name} eligibility: ${mentionedCourse.eligibility}` });
          } else {
            return res.json({ 
              reply: "✅ Course Eligibility:\n\n" + data.courses.map(c => ` • ${c.name}: ${c.eligibility}`).join("\n") 
            });
          }

        case "description":
          if (mentionedCourse) {
            return res.json({ reply: `ℹ️ ${mentionedCourse.name}:\n${mentionedCourse.description}` });
          } else {
            return res.json({ 
              reply: "We offer multiple IT and English courses for students and professionals. Ask about a specific course for detailed information!" 
            });
          }

        case "about":
          return res.json({ 
            reply: `🏛️ About Us:\n\nWe are ${data.institute_type} located in Negombo, providing quality IT and English courses.\n\n💡 You can ask about:\n• Courses\n• Fees\n• Duration\n• Start dates\n• Lecturers\n• Location\n• Contact information` 
          });

        default:
          break;
      }
    }

    // 5️⃣ Check FAQs with stricter fuzzy match
    const faqKeys = Object.keys(data.faqs);
    const faqMatches = stringSimilarity.findBestMatch(userMsg, faqKeys);
    if (faqMatches.bestMatch.rating > 0.4) {
      return res.json({ reply: data.faqs[faqMatches.bestMatch.target] });
    }

    // 6️⃣ Fallback response
    return res.json({
      reply: "I'm not sure I understood that. You can ask me about:\n• Courses\n• Fees & Payment\n• Duration\n• Start dates\n• Eligibility\n• Lecturers\n• Location\n• Contact information\n\nWhat would you like to know?",
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({ reply: "Sorry, I'm experiencing technical difficulties. Please try again later." });
  }
});


// GET endpoint to fetch all data
router.get('/data', (req, res) => {
  try {
    const data = loadData();
    res.json(data);
  } catch (err) {
    console.error('Error loading chatbot data:', err);
    res.status(500).json({ 
      error: 'Failed to load chatbot data',
      details: err.message 
    });
  }
});

// PUT endpoint to update entire data object
router.put('/data', (req, res) => {
  try {
    const newData = req.body;
    
    // Validate that we have data
    if (!newData || typeof newData !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    // Validate required fields exist
    const requiredFields = ['greeting', 'courses', 'lecturers', 'contact', 'faqs'];
    for (const field of requiredFields) {
      if (!(field in newData)) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    
    // Validate data types
    if (!Array.isArray(newData.courses)) {
      return res.status(400).json({ error: 'Courses must be an array' });
    }
    
    if (!Array.isArray(newData.lecturers)) {
      return res.status(400).json({ error: 'Lecturers must be an array' });
    }
    
    if (typeof newData.faqs !== 'object') {
      return res.status(400).json({ error: 'FAQs must be an object' });
    }
    
    if (typeof newData.contact !== 'object') {
      return res.status(400).json({ error: 'Contact must be an object' });
    }
    
    // Validate course structure
    for (let i = 0; i < newData.courses.length; i++) {
      const course = newData.courses[i];
      const requiredCourseFields = ['name', 'price', 'start_date', 'duration'];
      
      for (const field of requiredCourseFields) {
        if (!(field in course)) {
          return res.status(400).json({ 
            error: `Course ${i + 1} missing required field: ${field}` 
          });
        }
      }
      
      if (typeof course.price !== 'number' || course.price < 0) {
        return res.status(400).json({ 
          error: `Course ${i + 1} price must be a non-negative number` 
        });
      }
    }
    
    // Validate lecturer structure
    for (let i = 0; i < newData.lecturers.length; i++) {
      const lecturer = newData.lecturers[i];
      if (!lecturer.name || !lecturer.course) {
        return res.status(400).json({ 
          error: `Lecturer ${i + 1} must have name and course` 
        });
      }
    }
    
    // Save the data
    saveData(newData);
    
    res.json({ 
      success: true,
      message: 'Data updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('Error updating chatbot data:', err);
    res.status(500).json({ 
      error: 'Failed to update chatbot data',
      details: err.message 
    });
  }
});

// PUT endpoint for updating a specific section
router.put('/data/section/:sectionName', (req, res) => {
  try {
    const { sectionName } = req.params;
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    const data = loadData();
    
    // Validate section exists
    if (!(sectionName in data)) {
      return res.status(400).json({ error: `Invalid section: ${sectionName}` });
    }
    
    // Update the specific section
    data[sectionName] = value;
    
    // Save updated data
    saveData(data);
    
    res.json({ 
      success: true,
      message: `Successfully updated ${sectionName}`,
      data: data[sectionName]
    });
    
  } catch (err) {
    console.error('Error updating section:', err);
    res.status(500).json({ 
      error: 'Failed to update section',
      details: err.message 
    });
  }
});

// PUT endpoint for updating single course
router.put('/data/courses/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const courseData = req.body;
    
    const data = loadData();
    const courseIndex = data.courses.findIndex(c => c.name === courseId);
    
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Validate course data
    if (courseData.price && (typeof courseData.price !== 'number' || courseData.price < 0)) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    
    // Update course
    data.courses[courseIndex] = {
      ...data.courses[courseIndex],
      ...courseData
    };
    
    saveData(data);
    
    res.json({
      success: true,
      message: `Updated course: ${courseId}`,
      data: data.courses[courseIndex]
    });
    
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// PUT endpoint for updating single FAQ
router.put('/data/faqs/:question', (req, res) => {
  try {
    const question = decodeURIComponent(req.params.question);
    const { answer } = req.body;
    
    if (!answer) {
      return res.status(400).json({ error: 'Answer is required' });
    }
    
    const data = loadData();
    
    // Update or add FAQ
    data.faqs[question] = answer;
    
    saveData(data);
    
    res.json({
      success: true,
      message: `Updated FAQ: ${question}`,
      data: { question, answer }
    });
    
  } catch (err) {
    console.error('Error updating FAQ:', err);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

// DELETE endpoint for deleting FAQ
router.delete('/data/faqs/:question', (req, res) => {
  try {
    const question = decodeURIComponent(req.params.question);
    const data = loadData();
    
    if (!(question in data.faqs)) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    delete data.faqs[question];
    
    saveData(data);
    
    res.json({
      success: true,
      message: `Deleted FAQ: ${question}`
    });
    
  } catch (err) {
    console.error('Error deleting FAQ:', err);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// GET endpoint for health check
router.get('/health', (req, res) => {
  try {
    const data = loadData();
    res.json({ 
      status: 'healthy',
      dataFile: DATA_FILE,
      courses: data.courses?.length || 0,
      lecturers: data.lecturers?.length || 0,
      faqs: Object.keys(data.faqs || {}).length,
      lastModified: fs.statSync(DATA_FILE).mtime
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: err.message 
    });
  }
});

module.exports = router;
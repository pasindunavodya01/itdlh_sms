const express = require("express");
const fs = require("fs");
const stringSimilarity = require("string-similarity");

const router = express.Router();
const DATA_FILE = "./chatbot_data.json";

// Load JSON data
const loadData = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

// Define keyword mapping
const RESPONSES = {
  greeting: ["hi", "hello", "hey", "hii", "helloo" , "good morning", "good afternoon", "good evening", "good night", "howdy" ],
  courses: ["course", "courses", "coourses" , "class", "classes", "program", "programs", "programme", "programmes", "subject", "subjects", "training", "trainings"],
  lecturers: ["lecturer", "lecturers", "teacher", "staff", "lecturrs", "professor", "instructor", "faculty", "trainer", "tutor", "mentor"],
  location: ["location", "where", "place", "address", "situated", "situated at", "located", "located at", "found", "found at"],
  institute: ["institute", "government", "website", "organisation", "organization", "type", "kind", "category", "nature"],
  contact: ["contact", "call", "email", "phone", "reach", "contact details", "contact info", "phone number", "email address"],
  fees: ["fee", "fees", "price", "cost", "tuition", "charges", "amount", "pay", "payment", "payments"],
  duration: ["duration", "time", "length", "weeks", "period", "months", "years", "last", "lasting"],
  start_date: ["start", "starts", "starting", "date", "dates", "begin", "beginning", "commence", "commencing", "commencement"],
  intake: ["intake", "admission month", "admission", "apply", "join", "enroll", "enrol", "registration", "register"],
  eligibility: ["eligibility", "requirement", "requirements", "criteria", "qualifications", "qualifications needed", "need", "prerequisite", "prerequisites"],
  description: ["description", "about", "info", "details", "what", "purpose", "overview", "summary"],
  about: ["about", "who", "what", "information", "info", "join", "how", "this", "tell me about", "details", "detail" ]
};

router.post("/", (req, res) => {
  const userMsg = req.body.message?.toLowerCase()?.trim();
  if (!userMsg) return res.json({ reply: "Please type a message." });

  const data = loadData();

  // 1️⃣ Check greeting
  if (RESPONSES.greeting.some(k => userMsg.includes(k))) {
    return res.json({ reply: data.greeting });
  }

  // 2️⃣ Detect course mention
  const mentionedCourse = data.courses.find(c => userMsg.includes(c.name.toLowerCase()));

  // 3️⃣ Fuzzy match keywords
  let bestMatch = null;
  let bestRating = 0;
  Object.keys(RESPONSES).forEach(key => {
    const match = stringSimilarity.findBestMatch(userMsg, RESPONSES[key]);
    if (match.bestMatch.rating > bestRating) {
      bestRating = match.bestMatch.rating;
      bestMatch = key;
    }
  });

  // 4️⃣ Generate response
  if (bestMatch) {
    switch (bestMatch) {
      case "courses":
  return res.json({
    reply: data.courses
      .map(
        c => `${c.name}:\n  Starts: ${c.start_date}\n  Fee: Rs.${c.price.toLocaleString()}\n  Duration: ${c.duration}\n  Intake: ${c.intake_month}\n`
      )
      .join("\n") // The \n in the map function already creates a blank line when joined.
  });

      case "lecturers":
        return res.json({
          reply: data.lecturers.map(l => `${l.name} (${l.course})`).join("\n"),
        });
      case "location":
        return res.json({ reply: `Our institute is located at ${data.location}.` });
      case "institute":
        return res.json({ reply: `This is a ${data.institute_type}.` });
      case "contact":
        return res.json({ reply: data.faqs.contact });
      case "fees":
        if (mentionedCourse) {
          return res.json({ reply: `The fee for ${mentionedCourse.name} is Rs.${mentionedCourse.price.toLocaleString()}.` });
        } else {
          return res.json({ reply: data.courses.map(c => `${c.name}: Rs.${c.price.toLocaleString()}`).join("\n\n") });
        }
      case "duration":
        if (mentionedCourse) {
          return res.json({ reply: `${mentionedCourse.name} runs for ${mentionedCourse.duration}.` });
        } else {
          return res.json({ reply: data.courses.map(c => `${c.name}: ${c.duration}`).join("\n\n") });
        }
      case "start_date":
        if (mentionedCourse) {
          return res.json({ reply: `${mentionedCourse.name} starts on ${mentionedCourse.start_date}.` });
        } else {
          return res.json({ reply: data.courses.map(c => `${c.name}: ${c.start_date}`).join("\n\n") });
        }
      case "intake":
        if (mentionedCourse) {
          return res.json({ reply: `${mentionedCourse.name} intake is in ${mentionedCourse.intake_month}.` });
        } else {
          return res.json({ reply: data.courses.map(c => `${c.name}: intake in ${c.intake_month}`).join("\n\n") });
        }
      case "eligibility":
        if (mentionedCourse) {
          return res.json({ reply: `${mentionedCourse.name} eligibility: ${mentionedCourse.eligibility}` });
        } else {
          return res.json({ reply: data.courses.map(c => `${c.name}: ${c.eligibility}`).join("\n\n") });
        }
      case "description":
        if (mentionedCourse) {
          return res.json({ reply: `${mentionedCourse.name}: ${mentionedCourse.description}` });
        } else {
          return res.json({ reply: "We offer multiple IT and English courses for students and professionals. Ask about each course for details." });
        }
      case "about":
        return res.json({ reply: `${data.greeting} We provide IT and English courses. Ask about courses, fees, duration, start dates, intake, lecturers, location, or contact info.` });
      default:
        break;
    }
  }

  // 5️⃣ Check FAQs with fuzzy match
  const faqKeys = Object.keys(data.faqs);
  const faqMatches = stringSimilarity.findBestMatch(userMsg, faqKeys);
  if (faqMatches.bestMatch.rating > 0.4) {
    return res.json({ reply: data.faqs[faqMatches.bestMatch.target] });
  }

  // 6️⃣ Fallback
  return res.json({
    reply:
      "Sorry, I don’t know the answer to that yet. You can ask about courses, lecturers, location, eligibility, start dates, duration, intake, fees, or contact info.",
  });
});

module.exports = router;

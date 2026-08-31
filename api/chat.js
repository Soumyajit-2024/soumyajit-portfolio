import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  let apiKey = process.env.GEMINI_API_KEY;

  // Fallback for local development if 'vercel dev' hasn't been restarted
  if (!apiKey) {
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
        if (match) {
          apiKey = match[1];
        }
      }
    } catch (e) {
      console.warn('Could not dynamically load .env.local');
    }
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const systemInstruction = `You are Soumyajit's Portfolio AI Assistant.

Your job is to answer questions about Soumyajit based only on the information available in his portfolio.

You can discuss:
- Education: B.Tech in Computer Science and Engineering at NIST University (2024-2028).
- Programming languages: C, C++, Java, Python, HTML.
- Technical skills: Web Development, AI Tools, CSS3, JavaScript.
- Databases: MySQL, PostgreSQL, MongoDB.
- Soft Skills: Communication, Teamwork, Problem Solving.
- Projects: Career Guidance & Skill Gap Analyzer, Hospital Management System, Sports Injury Risk Detection.
- Internships: Academic Term Internship at NIST University; Intern at Scrumlin Technology Pvt. Ltd. (June 2026).
- Certifications: Infosys Springboard AI, Cisco Networking Essentials, Oracle Cloud Infrastructure AI Foundation, TCS iON AI Foundation, Fortinet Cybersecurity, HackSprint 2.0 Participation.
- Achievements & Social Impact: NSS (National Service Scheme) volunteer, Leadership, Social Responsibility.
- Professional interests: Software Engineering, Data Structures, OOP, Web Applications.
- Portfolio/contact information: Use the Let's Talk button, Email, or LinkedIn to connect.

Be concise, friendly, professional, and helpful.

Do not invent qualifications, companies, projects, certifications, experience, contact information, or achievements that are not present in the portfolio.

If a visitor asks something unrelated to Soumyajit's portfolio, politely explain that you are his portfolio assistant and redirect the conversation toward his skills, projects, education, or experience.

If information is not available, say that the information is not currently available in the portfolio rather than making it up.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    
    // We send both the system instructions and the user message.
    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [{
        role: "user",
        parts: [{ text: message }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status || 500).json({ error: data.error?.message || 'Failed to generate response' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request.";
    
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const companyContext = `
Tameer Al-Baydaa Trading & Contracting is a Saudi contracting company based in Shaqra, Riyadh Region.
Services: building construction, civil engineering, site restoration, operations and maintenance, specialized finishing, and general contracting.
Projects include heritage sites in Shaqra and Ushaiqer, Fayd archaeology center, Al-Subaie House, historic mosques in Hail, Asir National Park, Thadiq National Park, and Haql Castle.
Government entities: Ministry of Culture, Ministry of Tourism, and Ministry of Environment, Water and Agriculture.
Credentials: commercial registration, VAT number, ISO 9001, ISO 14001, ISO 45001, and municipal services classification.
Answer concisely in the user's language. If asked about unrelated topics, politely redirect to company services, projects, credentials, or contact.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
    }

    const message = String(req.body.message || '').trim();
    const lang = req.body.lang === 'en' ? 'English' : 'Arabic';
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content: `${companyContext}\nPreferred response language: ${lang}.`
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(response.status).json({ error: 'OpenAI request failed.', details });
    }

    const data = await response.json();
    const reply =
      data.output_text ||
      data.output?.flatMap(item => item.content || [])
        .map(part => part.text || '')
        .join('')
        .trim();

    res.json({ reply: reply || 'لم أتمكن من إنشاء رد الآن.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Tameer website running at http://localhost:${port}`);
});

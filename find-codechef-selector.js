import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function findCodeChefSelector() {
  const handle = 'sameerkadam05';
  
  try {
    const response = await axios.get(`https://www.codechef.com/users/${handle}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Save to file for manual inspection
    fs.writeFileSync('codechef-debug.html', response.data);
    console.log('✅ Saved HTML to codechef-debug.html for inspection\n');
    
    // Try to find "Fully Solved" text
    console.log('🔍 Searching for "Fully Solved" or problem counts...\n');
    
    $('*').each((i, el) => {
      const text = $(el).text();
      if (text.includes('Fully Solved') || text.includes('Partially Solved')) {
        console.log('Found element:', $(el).prop('tagName'));
        console.log('Classes:', $(el).attr('class'));
        console.log('Text:', text.trim().substring(0, 150));
        console.log('HTML:', $.html(el).substring(0, 200));
        console.log('---\n');
      }
    });
    
    // Check for specific section headers
    console.log('🔍 Looking for section headers...\n');
    $('header, h3, h4, h5').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 0 && text.length < 50) {
        console.log(`${$(el).prop('tagName')}: "${text}"`);
        const nextDiv = $(el).next();
        if (nextDiv.length) {
          console.log('  Next element:', nextDiv.text().trim().substring(0, 50));
        }
      }
    });

  } catch (error) {
    console.log('Error:', error.message);
  }
}

findCodeChefSelector();

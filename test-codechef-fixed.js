import axios from 'axios';
import * as cheerio from 'cheerio';

async function testCodeChefFixed() {
  const handle = 'sameerkadam05';
  
  console.log('🟤 Testing fixed CodeChef scraper...');
  
  try {
    const page = await axios.get(`https://www.codechef.com/users/${handle}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(page.data);

    // Find the h3 that contains "Total Problems Solved:"
    let solved = 0;
    $('h3').each((i, el) => {
      const text = $(el).text().trim();
      const match = text.match(/Total Problems Solved:\s*(\d+)/i);
      if (match) {
        solved = parseInt(match[1]);
        console.log(`✅ Found: "${text}"`);
        console.log(`✅ Extracted: ${solved} problems`);
        return false; // Break the loop
      }
    });

    if (solved === 0) {
      console.log('❌ Could not find problems solved count');
    } else {
      console.log(`\n🎉 SUCCESS! CodeChef shows ${solved} problems solved`);
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testCodeChefFixed();

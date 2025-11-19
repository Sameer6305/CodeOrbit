import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function debugCodeChef() {
  const handle = 'sameerkadam05';
  
  console.log('🟤 Debugging CodeChef for:', handle);
  
  try {
    const response = await axios.get(`https://www.codechef.com/users/${handle}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Save HTML to file for inspection
    fs.writeFileSync('codechef-page.html', response.data);
    console.log('✅ Saved HTML to codechef-page.html');
    
    const $ = cheerio.load(response.data);
    
    // Try to find the problems solved section
    console.log('\n🔍 Looking for problems solved...\n');
    
    // Check the page title
    console.log('Page title:', $('title').text());
    
    // Look for any divs with class containing 'problem'
    $('[class*="problem"]').each((i, el) => {
      console.log(`Element ${i}:`, $(el).attr('class'), '->', $(el).text().trim().substring(0, 100));
    });
    
    // Look for section with numbers
    $('.rating-number').each((i, el) => {
      console.log('Rating number:', $(el).text());
    });
    
    // Try the newer CodeChef layout
    $('.rating-data-section h3').each((i, el) => {
      console.log('H3:', $(el).text());
    });
    
    $('.rating-data-section section').each((i, section) => {
      const header = $(section).find('header').text();
      const value = $(section).find('.rating-number').text();
      console.log(`Section: ${header} = ${value}`);
    });
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugCodeChef();

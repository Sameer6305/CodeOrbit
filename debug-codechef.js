// Debug CodeChef HTML structure
import axios from 'axios';
import * as cheerio from 'cheerio';

async function debugCodeChef() {
  const handle = 'impranav011';
  
  try {
    const response = await axios.get(`https://www.codechef.com/users/${handle}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    console.log('\n🔍 Searching for problems solved...\n');
    
    // Method 1: Find by text content
    $('h5').each((i, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase().includes('problem')) {
        console.log(`Found h5: "${text}"`);
        console.log(`Parent classes: ${$(el).parent().attr('class')}`);
        console.log(`Next text: ${$(el).next().text()}\n`);
      }
    });
    
    // Method 2: Find by specific sections
    console.log('\n📊 Rating Data Section:');
    $('.rating-data-section').each((i, el) => {
      console.log(`Section ${i}:`);
      console.log($(el).text().substring(0, 200));
      console.log('---');
    });
    
    // Method 3: Find all numbers that could be problem count
    console.log('\n🔢 Looking for numbers:');
    $('div.rating-data-section').each((i, section) => {
      $(section).find('div').each((j, div) => {
        const text = $(div).text().trim();
        const numbers = text.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          console.log(`Found: "${text}" -> Numbers: ${numbers}`);
        }
      });
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugCodeChef();

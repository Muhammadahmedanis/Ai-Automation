// Test file to demonstrate enhanced NLP parser capabilities
import { parseNaturalLanguageQuery, isNaturalLanguageQuery, formatSearchQuery } from './nlpParser';

// Test examples demonstrating all the enhanced capabilities
const testQueries = [
  // Basic job title and location
  "I want to get all software engineers in Sweden",
  
  // Job title, industry, and revenue
  "Find me marketing directors in tech companies with $10M+ revenue",
  
  // Job title, company, and technologies
  "Show me CEOs at startups using React and AWS",
  
  // Job title and specific companies
  "Get all sales representatives at Google and Microsoft",
  
  // Job title, industry, and funding type
  "Find founders in fintech companies with Series A funding",
  
  // Job title, location, and technology
  "Looking for data scientists in New York using Python",
  
  // Job title and lookalike domain
  "Get all product managers at companies like Shopify",
  
  // Job title, industry, and company size
  "Find CTOs in healthcare startups with 50-200 employees",
  
  // Complex query with multiple parameters
  "I need senior software engineers at enterprise companies in London using Java and Docker with $1B+ revenue",
  
  // Names and companies
  "Find John Smith at Microsoft or Google",
  
  // Funding and technology
  "Show me seed-funded startups using machine learning",
  
  // Revenue and location
  "Get all companies in Silicon Valley with $50M-250M revenue",
  
  // Industry and employee count
  "Find manufacturing companies with 1000+ employees",
  
  // Technology stack
  "Looking for developers using React, Node.js, and MongoDB",
  
  // Funding stages
  "Get all Series B and Series C companies",
  
  // Specific names
  "Find contacts named Sarah or Emma in tech",
  
  // Lookalike domains
  "Find companies with websites similar to netflix.com",
  
  // Complex multi-parameter query
  "I want to find senior product managers at SaaS companies in San Francisco using AWS with $10M-50M revenue and 51-200 employees who have received Series A funding"
];

console.log('=== Enhanced NLP Parser Test Examples ===\n');

testQueries.forEach((query, index) => {
  console.log(`\n--- Example ${index + 1} ---`);
  console.log(`Query: "${query}"`);
  
  const isNatural = isNaturalLanguageQuery(query);
  console.log(`Is Natural Language: ${isNatural}`);
  
  if (isNatural) {
    const extracted = parseNaturalLanguageQuery(query);
    const formatted = formatSearchQuery(query, extracted);
    
    console.log('\nExtracted Parameters:');
    if (extracted.person_titles.length > 0) console.log(`  Job Titles: ${extracted.person_titles.join(', ')}`);
    if (extracted.locations.length > 0) console.log(`  Locations: ${extracted.locations.join(', ')}`);
    if (extracted.industries.length > 0) console.log(`  Industries: ${extracted.industries.join(', ')}`);
    if (extracted.employees.length > 0) console.log(`  Company Size: ${extracted.employees.join(', ')}`);
    if (extracted.revenues.length > 0) console.log(`  Revenue: ${extracted.revenues.join(', ')}`);
    if (extracted.technologies.length > 0) console.log(`  Technologies: ${extracted.technologies.join(', ')}`);
    if (extracted.funding_types.length > 0) console.log(`  Funding Types: ${extracted.funding_types.join(', ')}`);
    if (extracted.names.length > 0) console.log(`  Names: ${extracted.names.join(', ')}`);
    if (extracted.companies.length > 0) console.log(`  Companies: ${extracted.companies.join(', ')}`);
    if (extracted.lookalike_domains?.length > 0) console.log(`  Lookalike Domains: ${extracted.lookalike_domains.join(', ')}`);
    
    console.log(`\nFormatted Query: "${formatted}"`);
  }
  
  console.log('\n' + '='.repeat(80));
});

// Export for use in other files
export { testQueries }; 
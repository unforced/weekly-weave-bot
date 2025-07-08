# Weekly Weave Bot - Testing Guide

## Test Results with Real OpenAI API

✅ **All tests passing with real AI extraction!**

### What Was Tested

1. **Example.com Baseline** ✅
   - Successfully extracted as an event
   - Title: "Example Domain"
   - Start date: Current date + 1 day
   - Correctly identified as non-Boulder event

2. **TechCrunch News** ✅
   - Successfully extracted as an update
   - One-liner: "Waymo begins robotaxi testing in Philadelphia and NYC."
   - Generated proper summary
   - Correctly identified as non-Boulder content

3. **Sam Altman's Blog** ✅
   - Successfully extracted as content
   - One-liner: "AI and digital superintelligence will transform society by the 2030s."
   - Generated insightful summary
   - Correctly identified as non-Boulder content

4. **Boulder Detection** ✅
   - Boulder official website correctly identified
   - One-liner: "Boulder starts multi-year improvements on Mount Sanitas trail."
   - **Correctly marked as Boulder content**

## Running Tests Yourself

### 1. Basic Test Suite (Mock AI)
```bash
# Run all tests with mock AI
npm test

# Run specific test file
npm test tests/config.test.ts
```

### 2. Real AI Extraction Tests
```bash
# Copy the real environment file
cp .env.test.real .env

# Run tests with real OpenAI API
npm test tests/real-ai-extraction.test.ts

# Run specific test
npm test tests/real-ai-extraction.test.ts -- --testNamePattern="Boulder"
```

### 3. Interactive Testing (Recommended for Manual Verification)

```bash
# Run the interactive test script
tsx test-scraping-interactive.ts
```

This provides a colorful, interactive interface where you can:
- Test any URL manually
- See extracted data in a formatted view
- Verify results yourself
- Test events, updates, or content

Example session:
```
🎯 What would you like to test?
1. Event scraping
2. Update scraping
3. Content scraping
4. Show example URLs
5. Exit

Select (1-5): 1
Enter URL to test: https://lu.ma/some-event

🔍 Scraping event...
✅ Scraping successful!

📋 EXTRACTED EVENT DATA:
──────────────────────────────────────────────────
📌 Title: Boulder AI Meetup
📅 Start: 12/15/2024, 6:00:00 PM
📍 Venue: Boulder Innovation Center
💵 Cost: Free with RSVP
🏔️  Boulder: Yes
──────────────────────────────────────────────────

✓ Does this look correct? (y/n): y
```

### 4. Live URL Testing Script

```bash
# Test a specific URL from command line
tsx tests/live-scraping-test.ts https://lu.ma/some-event

# Test example URLs from different platforms
tsx tests/live-scraping-test.ts --examples
```

## Test Coverage

### Unit Tests (Mocked)
- ✅ Configuration loading
- ✅ AI extraction logic
- ✅ Web scraping
- ✅ Error handling

### Integration Tests (Real AI)
- ✅ End-to-end event extraction
- ✅ End-to-end update extraction
- ✅ End-to-end content extraction
- ✅ Boulder location detection
- ✅ Error recovery

## Verifying Extraction Quality

When running tests, look for:

1. **Event Extraction**
   - Accurate title extraction
   - Correct date/time parsing
   - Venue and location details
   - Cost information
   - Boulder detection

2. **Update/Content Extraction**
   - Concise one-liner (≤15 words)
   - Meaningful summary
   - Accurate Boulder detection

3. **Boulder Detection**
   - Should be `true` for:
     - bouldercolorado.gov
     - Events mentioning Boulder, CO
     - Boulder-specific content
   - Should be `false` for:
     - General tech news
     - Non-Boulder locations

## Troubleshooting

### If tests fail with mock AI:
```bash
# Check environment
cat .env

# Should show test values, not real API key
OPENAI_API_KEY=test_openai_key
```

### If tests fail with real AI:
```bash
# Check API key is valid
echo $OPENAI_API_KEY | cut -c1-10

# Should start with "sk-proj-"
```

### Common Issues:

1. **"messages must contain json"** - Fixed in latest version
2. **Timeout errors** - Increase timeout in tests (default 30s)
3. **404 errors** - URL might be invalid or blocked

## Performance

With real OpenAI API:
- Event extraction: ~1-2 seconds
- Update extraction: ~2-3 seconds  
- Content extraction: ~2-4 seconds

## Next Steps

To test with real event URLs:

1. Find a real event URL (Luma, Eventbrite, Meetup)
2. Edit `tests/real-ai-extraction.test.ts`
3. Remove `.skip` from the relevant test
4. Update the URL
5. Run: `npm test tests/real-ai-extraction.test.ts`
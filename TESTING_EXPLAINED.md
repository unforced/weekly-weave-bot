# Why Some Tests Are Skipped

## The Challenge with Event URLs

Event URLs from platforms like Luma, Eventbrite, and Meetup have several challenges:

1. **They Expire** - Events pass, pages get removed
2. **They Change** - URLs get redirected or updated
3. **Rate Limiting** - Repeatedly hitting the same URL can trigger blocks
4. **No Static Test Data** - We can't hardcode URLs that will work forever

## Our Solution: Dynamic Event Discovery

Instead of hardcoding event URLs, we created a more sophisticated testing approach:

### 1. Static Tests (Always Run)
```bash
npm test tests/real-ai-extraction.test.ts
```
- ✅ Tests with stable sites (example.com, techcrunch.com, etc.)
- ✅ Boulder detection with official Boulder sites
- ✅ General extraction quality

### 2. Dynamic Event Tests (On Demand)
```bash
npm test tests/dynamic-event-scraping.test.ts
```
This test:
1. Goes to platform homepages (lu.ma/boulder, eventbrite.com/d/co--boulder/events/)
2. Finds CURRENT event links automatically
3. Tests extraction on FRESH events
4. Validates the data quality

### 3. Manual Testing (Interactive)
```bash
tsx test-scraping-interactive.ts
```
Or test a specific URL:
```bash
tsx tests/live-scraping-test.ts https://lu.ma/your-event-here
```

## Why This Approach?

1. **Always Fresh** - Tests use current events, not expired ones
2. **Real World** - Tests actual live data, not mocked responses
3. **Platform Agnostic** - Automatically adapts to platform changes
4. **CI-Friendly** - Core tests don't depend on external event availability

## Running Platform-Specific Tests

To test real Luma/Eventbrite events:

### Option 1: Use Dynamic Discovery
```bash
USE_REAL_AI=1 npm test tests/dynamic-event-scraping.test.ts
```

### Option 2: Manual Test with Current URL
1. Find a current event on Luma/Eventbrite
2. Run: `tsx test-real-events.ts https://lu.ma/current-event`

### Option 3: Enable in Test File
1. Edit `tests/real-ai-extraction.test.ts`
2. Remove `.skip` from the test
3. Update the URL to a current event
4. Run: `npm test tests/real-ai-extraction.test.ts`

## Test Coverage Summary

| Test Type | What It Tests | When to Run |
|-----------|---------------|-------------|
| Unit Tests | Core logic with mocks | Every commit |
| Real AI Tests | Actual OpenAI extraction | Daily/Weekly |
| Dynamic Event Tests | Live platform scraping | Before releases |
| Interactive Tests | Manual verification | When debugging |

The skipped tests are there as templates - they show the structure for testing specific platforms when you have real URLs to test.
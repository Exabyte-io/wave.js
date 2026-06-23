const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Forward console logs to terminal
    page.on('console', msg => {
        console.log(msg.text());
    });

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[Stress-Test]') || text.includes('BENCHMARK')) {
            console.log(text);
        }
    });

    console.log("Navigating to http://localhost:5173/wave.js/benchmarks/benchmark.html");
    await page.goto('http://localhost:5173/wave.js/benchmarks/benchmark.html', { waitUntil: 'networkidle0' });
    
    // Wait for the benchmark to finish
    await page.waitForFunction(() => {
        return new Promise(resolve => {
            const originalLog = console.log;
            console.log = function(...args) {
                if (args[0] === 'BENCHMARK_DONE' || args[0] === 'BENCHMARK_ERROR') {
                    resolve(true);
                }
                originalLog.apply(console, args);
            };
        });
    }, { timeout: 120000 });
    
    await browser.close();
    process.exit(0);
})();

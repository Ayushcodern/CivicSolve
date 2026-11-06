import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT_DIR = "C:\\Users\\Ayush\\.gemini\\antigravity\\brain\\d99103cd-8d12-404f-9a44-a0a39ca4e519\\scratch\\screenshots";

mkdirSync(OUT_DIR, { recursive: true });

async function capture() {
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const publicRoutes = [
    { url: "http://localhost:8080/", file: "01_home.png" },
    { url: "http://localhost:8080/challenges", file: "02_challenges_list.png" },
    { url: "http://localhost:8080/challenges/1", file: "03_challenge_1_arsenic.png" },
    { url: "http://localhost:8080/challenges/2", file: "04_challenge_2.png" },
    { url: "http://localhost:8080/challenges/3", file: "05_challenge_3.png" },
    { url: "http://localhost:8080/challenges/4", file: "06_challenge_4.png" },
    { url: "http://localhost:8080/challenges/5", file: "07_challenge_5.png" },
    { url: "http://localhost:8080/challenges/6", file: "08_challenge_6.png" },
    { url: "http://localhost:8080/challenges/7", file: "09_challenge_7.png" },
    { url: "http://localhost:8080/challenges/8", file: "10_challenge_8.png" },
    { url: "http://localhost:8080/submit", file: "11_submit_wizard.png" },
    { url: "http://localhost:8080/impact", file: "12_impact_ledger.png" },
  ];

  for (const item of publicRoutes) {
    try {
      console.log(`Capturing ${item.url} -> ${item.file}`);
      await page.goto(item.url, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${OUT_DIR}/${item.file}`, fullPage: false });
    } catch (e) {
      console.error(`Failed ${item.url}:`, e.message);
    }
  }

  // Role dashboards with auth injection
  const dashboardRoutes = [
    {
      role: "CITIZEN",
      user: { userId: 1, name: "Ramesh Patel", email: "citizen@example.com", role: "CITIZEN" },
      url: "http://localhost:8080/dashboard/citizen",
      file: "13_dashboard_citizen.png",
    },
    {
      role: "FACULTY",
      user: { userId: 2, name: "Dr. Amit Sharma", email: "faculty@aitr.ac.in", role: "FACULTY", institutionId: 1 },
      url: "http://localhost:8080/dashboard/university",
      file: "14_dashboard_university.png",
    },
    {
      role: "MODERATOR",
      user: { userId: 4, name: "Dr. Sunita Deshmukh", email: "moderator@mp.gov.in", role: "MODERATOR" },
      url: "http://localhost:8080/dashboard/moderator",
      file: "15_dashboard_moderator.png",
    },
    {
      role: "ADMIN",
      user: { userId: 5, name: "Collector Rajesh Kumar, IAS", email: "admin@civicsolve.org", role: "ADMIN" },
      url: "http://localhost:8080/dashboard/government",
      file: "16_dashboard_government.png",
    },
  ];

  for (const item of dashboardRoutes) {
    try {
      console.log(`Capturing dashboard ${item.url} as ${item.role} -> ${item.file}`);
      await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
      await page.evaluate(({ role, user }) => {
        localStorage.setItem("civicsolve_token", `civicsolve_auth_${role}_test`);
        localStorage.setItem("civicsolve_user", JSON.stringify(user));
      }, { role: item.role, user: item.user });
      await page.goto(item.url, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${OUT_DIR}/${item.file}`, fullPage: false });
    } catch (e) {
      console.error(`Failed dashboard ${item.url}:`, e.message);
    }
  }

  await browser.close();
  console.log("All screenshots captured successfully.");
}

capture().catch(console.error);

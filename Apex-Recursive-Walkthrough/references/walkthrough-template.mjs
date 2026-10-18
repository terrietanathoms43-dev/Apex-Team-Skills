// <What this flow proves, in two lines: the journey, the roles involved, what the database must hold afterwards.>
//
// Usage: node scripts/test-walkthrough/0N-<flow>.mjs [--only=part,part] [--base=http://localhost:3021]
import { closePool, finish, only, openBrowser, query, step, stoppedOn, tidy } from "./lib.mjs";

// Unique titles keep a re-run from matching last time's rows.
const TITLE = `Walkthrough <thing> ${Date.now().toString().slice(-5)}`;
const started = new Date();
const browsers = {};

/** The visible buttons: the honest way to say "no decision controls" (prose contains words like "decided"). */
const buttonTexts = (browser) =>
  browser.evaluate(`[...document.querySelectorAll("main button")].filter((e) => e.offsetParent !== null).map((e) => e.textContent.trim())`);

try {
  if (only("create")) {
    const member = (browsers.member = await openBrowser({ role: "member", width: 1280, height: 900 }));
    await member.goto("/tasks", 4000);
    await member.press("n", 1200);
    step("N opens the dialog", (await member.evaluate(`!!document.querySelector("#task-title")`)) === true);
    await member.type("#task-title", TITLE);
    await member.click("Create task", { exact: true, wait: 2500 });
    step("creating shows the toast", await member.waitFor("Task created."));
    const [row] = await query("select id, status from tasks where title = $1", [TITLE]);
    step("the row exists with the right status", row?.status === "not_started", JSON.stringify(row));
  }

  if (only("roles")) {
    const [row] = await query("select id from tasks where title = $1", [TITLE]);
    const other = (browsers.other = await openBrowser({ role: "other", width: 1280, height: 900 }));
    await other.goto(`/tasks/${row.id}`, 4000);
    step("another workspace gets Not found", await other.waitFor("Not found"));
    step("and no actions", !(await buttonTexts(other)).some((text) => text === "Update progress"));
  }

  if (only("notified")) {
    const notices = await query("select u.email, n.kind from notifications n join users u on u.id = n.user_id where n.created_at >= $1", [started]);
    step("only the right person heard about it", notices.every((row) => row.email === "morgan@trackwise.test"), JSON.stringify(notices));
  }
} catch (error) {
  await stoppedOn(error, "0N", browsers); // a screenshot per open browser, so the failure can be looked at
  step("flow ran to the end", false);
} finally {
  for (const browser of Object.values(browsers)) await browser.close();
  await closePool();
  tidy(); // only when the script wrote something
  finish();
}

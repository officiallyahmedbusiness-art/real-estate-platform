import { execFileSync } from "node:child_process";

function runCheck(label, url) {
  const command =
    `$u='${url}?t='+[guid]::NewGuid(); ` +
    "$h=(Invoke-WebRequest -Headers @{'Cache-Control'='no-cache'} -Uri $u).Content; " +
    `'${label} has_QQQ=' + [bool]($h -match '\\?{3,}') ; ` +
    `'${label} has_home_dot=' + [bool]($h -match 'home\\.') ; ` +
    `'${label} has_fake_trust=' + [bool]($h -match 'Nasr City|Abbas|10 AM|10 minutes|Trust & Contact')`;

  const output = execFileSync(
    "powershell",
    ["-NoProfile", "-Command", command],
    { encoding: "utf8" }
  );
  process.stdout.write(output);

  const flags = {
    hasQQQ: /has_QQQ=True/i.test(output),
    hasHomeDot: /has_home_dot=True/i.test(output),
    hasFakeTrust: /has_fake_trust=True/i.test(output),
  };

  return flags;
}

const home = runCheck("HOME", "https://hrtaj.com/");
const listings = runCheck("LIST", "https://hrtaj.com/listings");

const anyBad = Object.values(home).some(Boolean) || Object.values(listings).some(Boolean);
if (anyBad) {
  console.error("Live verify failed.");
  process.exit(1);
} else {
  console.log("Live verify passed.");
}

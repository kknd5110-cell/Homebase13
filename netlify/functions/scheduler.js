const https = require("https");

const FIREBASE_URL = "homebase-web-5d14e-default-rtdb.firebaseio.com";
const FIREBASE_SECRET = process.env.FIREBASE_SECRET;

function setReservationOpen(value) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(value);
    const options = {
      hostname: FIREBASE_URL,
      path: `/reservationOpen.json?auth=${FIREBASE_SECRET}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve(body));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

exports.handler = async function (event, context) {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const h = kst.getUTCHours();
  const m = kst.getUTCMinutes();

  if (h === 16 && m >= 35 && m <= 45) {
    await setReservationOpen(true);
    return { statusCode: 200, body: "예약 ON" };
  }

  if (h === 0 && m <= 5) {
    await setReservationOpen(false);
    return { statusCode: 200, body: "예약 OFF" };
  }

  return { statusCode: 200, body: `스킵 (${h}:${String(m).padStart(2, "0")} KST)` };
};

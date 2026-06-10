const tests = [
  {
    name: "login direct 8080",
    url: "http://127.0.0.1:8080/api/v1/auth/login",
  },
  {
    name: "login via next proxy",
    url: "http://127.0.0.1:3000/api/kumbu/auth/login",
  },
];

const body = JSON.stringify({
  email: "admin@kumbu.app",
  password: "Admin123!",
});

for (const t of tests) {
  try {
    const res = await fetch(t.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body,
    });
    const text = await res.text();
    console.log(`\n=== ${t.name} HTTP ${res.status} ===`);
    console.log(text.slice(0, 500));
  } catch (err) {
    console.log(`\n=== ${t.name} FAILED ===`);
    console.log(err.message);
  }
}

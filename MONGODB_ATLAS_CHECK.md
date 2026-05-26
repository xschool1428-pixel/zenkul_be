## MongoDB Atlas Check

This app already supports MongoDB Atlas. The connection flow is:

- `src/server.js` -> calls `connectDatabase()`
- `src/config/database.js` -> calls `mongoose.connect(config.mongodbUri)`
- `src/config/index.js` -> reads `MONGODB_URI` from `.env`

So there is no separate Atlas-only code needed. If `MONGODB_URI` points to Atlas, the app will use Atlas.

### Quick verification

Run this first:

```powershell
npm run mongo:check
```

Success output should include:

- `MongoDB ping succeeded.`
- `Host: ...mongodb.net`
- `Database: ...`

Then continue with:

```powershell
npm run seed
npm start
```

### Current error meaning

If you see:

```text
querySrv ECONNREFUSED _mongodb._tcp.<cluster-host>
```

that means Atlas itself was not reached yet. The DNS SRV lookup failed before MongoDB login even started.

### Common fixes for `querySrv ECONNREFUSED`

1. In Atlas, open the cluster connection dialog and copy the **standard connection string** instead of the `mongodb+srv` string.
2. Put that standard URI into `MONGODB_URI` in `.env`.
3. Retry `npm run mongo:check`.
4. If needed, change your DNS resolver to `8.8.8.8` or `1.1.1.1`.
5. Temporarily disable VPN, proxy, or firewall software that may block SRV lookups.

### Notes

- IP Access List being open is good, but it does not fix DNS/SRV lookup failures.
- If the error changes to authentication or IP authorization, the app now logs a more specific hint during startup.

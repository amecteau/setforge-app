# Releasing SetForge to the Google Play Store

## APK vs AAB

| Format | Use case | Signing required? |
|---|---|---|
| **Debug APK** | Sideload directly to a device for testing | No — auto-signed with a throwaway debug key |
| **Release APK** | Sideload a production build | Yes — needs your keystore |
| **AAB** | Upload to Google Play Store | Yes — must be signed with your upload key |

The CI workflow currently produces a **debug APK** on every release tag. To publish on the Play Store you need a **signed AAB** as well. Both outputs can be attached to the same GitHub Release — you sideload the APK for QA and manually upload the AAB to the Play Console.

An unsigned AAB can be built (`npx tauri android build --aab`) but Google Play will reject it. Signing must be in place before the AAB is useful.

---

## How Android signing works

You generate the keystore yourself — Google does not provide a key. For new apps the Play Store uses a **two-key system**:

| Key | Who holds it | Purpose |
|---|---|---|
| **Upload key** | You (your keystore file) | You sign the AAB before uploading. Play Console verifies it's really you. |
| **App signing key** | Google (Play App Signing) | Google re-signs the APKs it delivers to users' devices. |

Enrolling in **Play App Signing** is mandatory for new apps since 2021. The benefit: if you ever lose your keystore you can rotate the upload key — Google still holds the real signing key so existing users can still receive updates.

---

## Generating the keystore

Run this once locally. Keep `release.keystore` safe — **never commit it to git**.

**PowerShell (Windows):**
```powershell
keytool -genkey -v -keystore release.keystore -alias setforge -keyalg RSA -keysize 2048 -validity 10000
```

**bash/zsh (macOS / Linux):**
```bash
keytool -genkey -v -keystore release.keystore -alias setforge \
  -keyalg RSA -keysize 2048 -validity 10000
```

You will be prompted for:
- A keystore password
- A key password (can be the same as the keystore password)
- Basic identity info (name, org, country — used to generate the certificate)

---

## Wiring signing into CI (task 6.13)

1. Base64-encode the keystore file:
   ```bash
   base64 -w 0 release.keystore
   ```
2. Add four GitHub repository secrets:
   | Secret | Value |
   |---|---|
   | `ANDROID_KEYSTORE` | Base64-encoded keystore content |
   | `ANDROID_KEY_ALIAS` | `setforge` (or whatever alias you chose) |
   | `ANDROID_KEY_PASSWORD` | Key password |
   | `ANDROID_STORE_PASSWORD` | Keystore password |
3. In the CI workflow, decode the keystore before the build step:
   ```yaml
   - name: Decode keystore
     run: echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 -d > release.keystore
   ```
4. Configure the signing block in `src-tauri/gen/android/app/build.gradle` to point at the decoded keystore and read the passwords from environment variables.
5. Change the build step from `--apk --debug` to `--aab` for the signed bundle, keeping a separate `--apk --debug` step for the dev APK.

---

## First upload to Google Play

1. Create an app in the [Play Console](https://play.google.com/console).
2. Upload the signed AAB to the **Internal testing** track first.
3. Play Console will prompt you to opt into Play App Signing — accept it.
4. Fill in the store listing (description, screenshots, content rating, pricing).
5. Promote from Internal → Closed testing → Open testing → Production as confidence grows.

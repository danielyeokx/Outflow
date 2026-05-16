Here's the recommended workflow:

  ---
  Day-to-day development
  
    cd /Users/danielyeo/Desktop/Outflow && npx expo start
  
  Press i for iOS Simulator. Hot reload on every save — fast iteration for UI and functionality.

  ---
  When you want to update the app on your phone

  1. Make sure all changes are working in simulator
  2. Open Xcode → ios/outflow.xcworkspace
  3. Select your iPhone 16 Pro as target
  4. Change scheme to Release (if not already set)
  5. Press ▶ Run (⌘R)
  6. Done — unplug and go

  Takes 3–5 minutes. No terminal needed after.

  ---
  Good habit — commit before porting
  git add . && git commit -m "describe what changed"
  git push
  This keeps GitHub in sync and gives you a restore point if something breaks on device.

  ---
  Certificate renewal (every 7 days, free account)

  Same as porting — just press ▶ Run in Xcode. Xcode auto-renews the certificate, no other steps.

  ---
  The one difference between simulator and device to watch for: keyboard behaviour (like the sheet issue we logged). Always do a quick device test after major UI changes before assuming it looks right on phone.
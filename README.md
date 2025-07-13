Date: July 13, 2025

Developer: Noel Christian Soberano

📱 Mobile-Friendly Dashboard
This web app is fully responsive and works beautifully across mobile devices!
✅ Optimized for:
  - iPhone 12 and other iOS smartphones
  - A wide range of Android phones
  - Tablets of various screen sizes
🛠️ Challenges & Fixes
Challenge:
  - Initially used vh (viewport height) for container sizing. This caused containers to shrink too much when the viewport height decreased (e.g., on mobile when browser UI is visible).

Fix:
  - Switched to using fixed px values for minimum heights where appropriate
  - Used clamp() for font sizes and flexible layout scaling to better handle different screen sizes

Status:The dashboard layout has been refined for a smooth and adaptive user experience — and it's all done! 🙌

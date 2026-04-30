---
Task ID: 1
Agent: Super Z (Main)
Task: Add HR module and Chatbot widget to FreightFlow Pro frontend

Work Log:
- Verified ArrowRight was already imported in parcels-page.tsx (no fix needed)
- Created chatbot-widget.tsx — floating AI chatbot with FlowBot persona
- Created /api/chat/route.ts — chat API with logistics reference detection
- Created /api/scan/route.ts — scan API for barcode/QR code lookup
- Created hr-page.tsx — comprehensive HR module (1,462 lines, 7 tabs)
- Created expenses-page.tsx — expense management module (889 lines, 5 tabs)
- Added 'hr' and 'expenses' to PageType in cargo-store.ts
- Added HR and Expenses modules to module-config.ts with Briefcase/Wallet icons
- Added HR/Expenses to pageNameMap in dashboard-layout.tsx
- Imported HR and Expenses pages in page.tsx PageRenderer
- Chatbot widget already integrated into dashboard-layout.tsx (import + render)
- Build verified: compiled successfully with all routes registered

Stage Summary:
- Chatbot widget (FlowBot) is visible as a floating button on every page
- HR module (Ressources Humaines) visible in sidebar under "Gestion" group
- Expenses module (Gestion des Dépenses) visible in sidebar under "Gestion" group
- Scanner page has /api/scan endpoint for autonomous code lookup
- Chat API has /api/chat endpoint for autonomous chatbot responses
- All 3 API routes working: /api, /api/chat, /api/scan

---
Task ID: 1
Agent: Main Agent
Task: Fix 4 bugs: Contrats actions, RH Recrutement détails, Notes de frais menu 3 points, Portail Client Documents

Work Log:
- Analyzed all 4 buggy components to identify the root causes
- Contracts page: Download button had empty onClick, Renew/Modify/Resiliate buttons in detail dialog had no handlers
- HR Recruitment: "Détails" button on job cards had no onClick handler, no detail dialog existed
- Expenses Notes de Frais: MoreHorizontal (3 dots) button had no onClick, no dropdown menu
- Customer Portal Documents: Download button had no onClick, no preview capability

- Fixed contracts-page.tsx:
  - Added handleDownloadContract() - generates and downloads a text file with full contract details
  - Added handleRenewContract() - creates a renewed contract copy with new dates
  - Added handleResiliateContract() - changes contract status to 'resilie'
  - Updated all action buttons in detail dialog with onClick handlers
  - Updated Download button in table with handleDownloadContract onClick

- Fixed hr-page.tsx:
  - Added showJobDetailDialog and selectedJob state
  - Added onClick handler to "Détails" button on job cards
  - Created full Job Detail Dialog with: header, info grid (lieu, contrat, candidats, date), recruitment pipeline visualization, and action buttons (Passer en cours, Fermer le poste, Réouvrir)

- Fixed expenses-page.tsx:
  - Added DropdownMenu, Dialog imports and Eye, Edit3, Trash2 icon imports
  - Added showDetailDialog and selectedExpense state
  - Replaced dead MoreHorizontal button with full DropdownMenu containing:
    - "Voir les détails" - opens detail dialog
    - "Approuver" (only for en_attente status)
    - "Rejeter" (only for en_attente status)
    - "Télécharger" - generates and downloads expense note as text file
  - Added Expense Detail Dialog with full info and approve/reject actions

- Fixed customer-portal-page.tsx:
  - Added showDocumentPreview state
  - Added handleDownloadDocument() function - generates downloadable text file
  - Replaced single dead Download button with two buttons: "Voir" (preview) and "Télécharger" (download)
  - Added Document Preview Dialog with: header with type icon, info grid, preview area, download/close actions

- Build passed successfully with zero errors

Stage Summary:
- All 4 bugs fixed and verified with successful build
- Contracts: Download, Renew, Modify, Resiliate actions now functional
- HR Recruitment: Detail dialog now shows job info and recruitment pipeline
- Expenses: 3-dot menu now shows dropdown with View/Approve/Reject/Download actions
- Customer Portal: Documents can now be previewed and downloaded

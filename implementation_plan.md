# Goal Description
Add a feature that allows authenticated users to save a URL with an optional title from the Home dashboard. The saved items should be stored in MongoDB (using the existing `Item` model) and displayed on the Home page.

## Proposed Changes
---
### Frontend
- **Home.jsx**: Add a form with inputs for `URL` and `Title`, submit button.
- **Create `src/features/items/hook/useItems.jsx`**: Hook exposing `items`, `loading`, `error`, `fetchItems`, `saveItem` using the existing [auth.api.jsx](file:///c:/Users/KIIT0001/Desktop/Smart-search/Frontend/src/features/auth/services/auth.api.jsx) (or a new `items.api.jsx`).
- **Create `src/features/items/services/items.api.jsx`**: Axios wrapper with `saveItem` (POST `/api/items`) and `getItems` (GET `/api/items`).
- **Update [Home.jsx](file:///c:/Users/KIIT0001/Desktop/Smart-search/Frontend/src/pages/Home.jsx)** to display a list of saved items (URL as clickable link, title displayed).
- **Update Redux store** (optional) – not required; hook manages local state.

---
### Backend
- **Create `src/controllers/item.controller.js`** with:
  ```js
  import Item from "../models/item.model.js";
  export const saveItem = async (req, res) => {
    const { url, title } = req.body;
    const item = await Item.create({ url, title, userId: req.user.id });
    res.status(201).json({ item });
  };
  export const getItems = async (req, res) => {
    const items = await Item.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ items });
  };
  ```
- **Create `src/validators/item.validator.js`** using `express-validator`:
  ```js
  import { body } from "express-validator";
  export const saveItemValidator = [
    body("url").trim().isURL().withMessage("Valid URL is required"),
    body("title").optional().trim(),
  ];
  ```
- **Update [src/routes/items.routes.js](file:///c:/Users/KIIT0001/Desktop/Smart-search/Backend/src/routes/items.routes.js)** to import the new controller and validator (already imports placeholders).
- Ensure `verifyAuth` middleware attaches `req.user` (already present).

---
### Database
- The `Item` model already exists and includes `url`, `title`, `userId`, timestamps.

## Verification Plan
### Automated Tests
- **Backend**: Run `npm test` (if a test suite exists) after adding unit tests for `saveItem` and `getItems` (optional). Since no test framework is present, we will rely on manual verification.

### Manual Verification
1. Start backend (`nodemon server.js`) and frontend (`npm run dev`).
2. Register/login a user.
3. On the Home dashboard, fill the **URL** field (e.g., `https://example.com`) and optional **Title**.
4. Click **Save**. The form should clear and the new item appear in the list below.
5. Verify the item is persisted by refreshing the page – the list should still show the saved entry.
6. Click the URL link to ensure it opens the target site.
7. Attempt to submit an invalid URL – the UI should display validation errors from the backend.

---
### Acceptance Criteria
- Form validates URL client‑side (required) and shows backend validation errors.
- Saved items are displayed with title (if provided) and clickable URL.
- Items are scoped to the logged‑in user (no cross‑user leakage).
- No CORS or authentication errors occur.

# In-App Warning Popups

**Last Updated:** [Date]

## Warning Messages for Display in Mobile App

These warning messages should be displayed as popups, modals, or banners at appropriate points in the user journey.

---

### Warning 1: No Delivery Guarantee

**Title:** Important Notice

**Message:**
"This platform does NOT guarantee delivery. All exchanges are voluntary and users participate at their own risk. The platform is a digital connector only and does not provide delivery services."

**Display When:**
- First-time user registration
- Before creating a delivery request
- Before accepting a delivery as a commuter

---

### Warning 2: Prohibited Items

**Title:** Prohibited Items Warning

**Message:**
"Do NOT send illegal or restricted items. Prohibited items include: tobacco, alcohol, medicines, cash, valuables, perishable food, weapons, flammable items, and any items violating Singapore law. Violations may result in account termination and legal action."

**Display When:**
- Before creating a delivery request
- In the item description input screen
- When user attempts to submit a request

---

### Warning 3: Voluntary Exchanges

**Title:** Voluntary Participation

**Message:**
"All exchanges are voluntary between individuals. Commuters are not employees or contractors. Senders are not purchasing a commercial service. This is a community platform, not a business."

**Display When:**
- First-time user onboarding
- Before accepting a delivery request
- In user profile/settings

---

### Warning 4: Not a Business

**Title:** Platform Disclaimer

**Message:**
"The platform is not a business or courier company. It is a community experimental platform in beta testing. No commercial services are provided, and no guarantees are made."

**Display When:**
- App launch (first time only)
- In terms and conditions acceptance screen
- In help/support section

---

## Implementation Notes

### Display Frequency
- **Critical warnings** (No Delivery Guarantee, Prohibited Items) should appear every time a user attempts a relevant action
- **Informational warnings** (Voluntary Exchanges, Not a Business) can appear during onboarding and be accessible in settings

### User Acknowledgment
- Users should be required to acknowledge critical warnings before proceeding
- Use checkboxes or "I Understand" buttons for critical warnings
- Allow users to dismiss informational warnings but make them easily accessible again

### Design Considerations
- Use clear, prominent styling (e.g., warning colors, icons)
- Ensure text is readable and not too lengthy
- Provide "Learn More" links to full legal documents
- Make warnings dismissible but easily accessible again

### Technical Implementation
- Store acknowledgment state in user profile/local storage
- Show warnings based on user action context
- Allow users to view all warnings in Settings/Help section
- Update warning display logic when terms change

---

## Additional Contextual Warnings

### Before Payment
**Message:** "Payment is voluntary appreciation only, not a service fee. The platform does not handle payments. All payments are direct user-to-user via PayNow."

### Before Reporting
**Message:** "You are about to report a user or item. False reports may result in account suspension. Only report genuine violations of platform rules or illegal activity."

### Account Suspension Risk
**Message:** "Violating platform rules may result in immediate account suspension or termination. Please review the Safe Operating Rules before proceeding."

---

**These warnings are essential safety and legal protections. They must be displayed appropriately throughout the user journey.**


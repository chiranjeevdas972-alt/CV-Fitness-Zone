# Security Specification for CV Fitness Zone

## Data Invariants
1. A user's role and gymId are immutable except by admins.
2. Members and trainers must belong to a valid gym.
3. Access to member-specific data (payments, attendance) is restricted to admins, trainers of that gym, or the member themselves.
4. Announcements and Inventory are gym-specific and publicly readable by members of that gym, but writable only by staff.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to create a user profile with `role: 'admin'` as a non-admin.
2. **Gym Leakage**: Attempt to read members from a different gymId.
3. **Ghost Field Injection**: Attempt to update a user doc with a hidden field `isSuperAdmin: true`.
4. **Terminal State Bypass**: Attempt to change a payment status from `paid` to `overdue` as a non-admin. (Not explicitly implemented yet, but good to keep in mind).
5. **ID Poisoning**: Attempt to create a document with a 1MB string as the ID.
6. **PII Leakage**: Attempt to read another user's email without proper authorization.
7. **Query Scraper**: Attempt to list all users without a where clause.
8. **Unverified Write**: Attempt to create a member as a user with `email_verified: false`.
9. **Atomic Desync**: Attempt to create an attendance record without a corresponding member record existence check.
10. **Role Escalation**: Existing trainer attempts to update their own role to 'admin'.
11. **Negative Payment**: Attempt to create a payment with a negative amount.
12. **Future Attendance**: Attempt to log attendance with a future date.

## Test Runner (Draft Logic)
The `firestore.rules` must ensure:
- `request.auth.token.email_verified == true` for any write.
- `resource.data.gymId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.gymId` for listing.
- `isValidId()` check on all document IDs.
- `hasOnly()` on all updates to restrict field modification.

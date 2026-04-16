# 🧪 NRI Wallet Testing Guide

## Quick Access
- **Dev Server**: http://localhost:5173/
- **Status**: ✅ Running

---

## 🎯 Critical Tests to Perform

### 1. Account Management (MODAL UX) ✨

#### Test: Create New Account
1. Click **"+ Add Account"** button
2. ✅ **Verify**: Modal opens with smooth animation
3. Fill in the form:
   - Account Type: Bank Account
   - Account Name: Test Bank
   - Current Balance: 5000
   - Currency: THB (฿)
   - Bank Name: Bangkok Bank
   - Account Number: 1234
4. Click **"Add Account"**
5. ✅ **Verify**: 
   - Success toast appears
   - Modal closes
   - New account appears in list with ฿ symbol

#### Test: Edit Existing Account
1. Click the **pencil icon** on SCB - Bangkok account
2. ✅ **Verify**: Modal opens (not inline form!)
3. Change balance to: 2945
4. Click **"Update Account"**
5. ✅ **Verify**: 
   - Modal closes
   - Balance updates correctly
   - Currency symbol (฿) displays correctly

#### Test: Modal Close Options
1. Open account modal
2. Test closing by:
   - ✅ Clicking backdrop (outside modal)
   - ✅ Clicking × button
   - ✅ Clicking "Cancel" button
3. ✅ **Verify**: Modal closes smoothly each time

---

### 2. Expense Management with Account Refund

#### Test: Add Expense Linked to Account
1. Go to **Add Expense** page
2. Fill in:
   - Date: Today
   - Amount: 411
   - Currency: THB (฿)
   - Category: Food & Dining
   - Payment Method: Bank Transfer
   - **Pay From Account**: Select "SCB - Bangkok"
   - Description: Dinner at Vrindavan restaurant
3. Click **"Add Expense"**
4. ✅ **Verify**:
   - Success message appears
   - Account balance decreased by 411 THB
   - Expense appears in list

#### Test: Delete Expense (Account Refund)
1. Find the expense you just added
2. Click the **🗑️ delete icon**
3. ✅ **Verify**: 
   - Confirmation modal appears
   - Shows expense details
   - Shows amount with correct currency symbol
4. Click **"Delete"**
5. ✅ **Verify**:
   - Expense is deleted
   - **Account balance is refunded** (increased by 411 THB)
   - Success toast appears

---

### 3. Currency Symbol Display

#### Test: Multiple Currency Accounts
1. Create accounts with different currencies:
   - USD account → Should show $
   - EUR account → Should show €
   - THB account → Should show ฿
   - INR account → Should show ₹
2. ✅ **Verify**: Each account card shows correct symbol

#### Test: Expense Currency Display
1. Add expenses in different currencies
2. ✅ **Verify**: Expense cards show correct currency symbols

---

### 4. End-to-End Flow

#### Complete User Journey
1. **Create Account**
   - Add new THB account with 5000 balance
2. **Add Income**
   - Add 2000 THB income to account
   - ✅ Verify balance = 7000
3. **Add Expense**
   - Add 500 THB expense from account
   - ✅ Verify balance = 6500
4. **Edit Account**
   - Open modal, update account name
   - ✅ Verify modal UX is smooth
5. **Delete Expense**
   - Delete the 500 THB expense
   - ✅ Verify balance returns to 7000 (refunded)
6. **Delete Account**
   - Delete the test account
   - ✅ Verify clean deletion

---

## 🔍 Edge Cases to Test

### 1. Insufficient Balance
1. Create account with 100 THB
2. Try to add expense of 500 THB
3. ✅ **Verify**: Warning message appears

### 2. Delete Account with Expenses
1. Create account and link expenses
2. Try to delete account
3. ✅ **Verify**: Appropriate handling

### 3. Currency Conversion
1. Add expense in USD to THB account
2. ✅ **Verify**: Conversion preview appears
3. ✅ **Verify**: Correct exchange rate shown

### 4. Modal Interaction
1. Open account modal
2. Click backdrop while form has data
3. ✅ **Verify**: Form closes (data lost) - this is expected
4. Re-open and fill form
5. Click "Cancel"
6. ✅ **Verify**: Form resets

---

## 🐛 Bug Checklist

### Previously Fixed Issues:
- [x] Currency symbols display correctly
- [x] Account update works (updateRecord fixed)
- [x] Expense add works (no auto-increment conflicts)
- [x] Expense delete refunds account
- [x] Modal UX implemented

### Test These Don't Regress:
- [ ] Account balance calculations
- [ ] Currency conversions
- [ ] Auto-categorization
- [ ] Toast notifications
- [ ] Form validation

---

## 📱 Mobile Testing

1. Open on mobile browser (or resize to mobile)
2. Test modal responsiveness:
   - ✅ Modal fits screen
   - ✅ Easy to close
   - ✅ Form is scrollable
3. Test account cards:
   - ✅ Grid adjusts to single column
   - ✅ Readable on small screens

---

## 🎨 UX Quality Checklist

### Modal Experience:
- [x] Smooth animations (fadeIn, slideUp)
- [x] Backdrop blur effect
- [x] Easy to close (multiple options)
- [x] Prevents body scroll
- [x] Sticky header on scroll
- [x] Mobile responsive
- [x] Clear visual hierarchy

### Feedback:
- [x] Success toasts appear
- [x] Error toasts appear
- [x] Loading states shown
- [x] Confirmation dialogs
- [x] Clear call-to-action buttons

### Data Integrity:
- [x] Account balances accurate
- [x] Expense refunds work
- [x] Currency symbols correct
- [x] Timestamps accurate

---

## 🚀 Performance Tests

1. **Large Dataset**:
   - Create 50 accounts
   - Add 500 expenses
   - ✅ Verify: Page loads fast
   - ✅ Verify: Scrolling is smooth

2. **Quick Operations**:
   - Rapidly add/delete expenses
   - ✅ Verify: No race conditions
   - ✅ Verify: Balance updates correctly

3. **Modal Performance**:
   - Open/close modal 10 times rapidly
   - ✅ Verify: No memory leaks
   - ✅ Verify: Animations smooth

---

## 📊 Success Criteria

### All Tests Pass ✅
- [ ] Account CRUD operations work
- [ ] Expense CRUD operations work
- [ ] Modal UX is smooth and intuitive
- [ ] Currency symbols display correctly
- [ ] Account refunds work on expense delete
- [ ] No console errors
- [ ] All toast notifications appear
- [ ] Mobile responsive
- [ ] Fast performance

---

## 🎯 Final Verification

Run this complete flow:

```
1. Open http://localhost:5173/
2. Navigate to Accounts
3. Click "+ Add Account" → ✅ Modal opens
4. Add THB account → ✅ Symbol shows ฿
5. Click Edit → ✅ Modal opens
6. Update balance → ✅ Saves successfully
7. Add expense linked to account → ✅ Balance decreases
8. Delete expense → ✅ Balance refunded
9. Verify no console errors → ✅ Clean
10. Test on mobile screen → ✅ Responsive
```

**If all ✅ pass → Application is ready!**

---

## 📞 Support

If you find any issues:
1. Check browser console for errors
2. Verify dev server is running
3. Clear browser cache and reload
4. Check this guide for expected behavior

**Happy Testing! 🚀**

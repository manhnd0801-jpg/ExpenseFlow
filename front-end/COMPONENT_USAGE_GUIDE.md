# 🎨 Component Usage Guide

Quick reference for using all available components in the Expense Flow application.

---

## 🔵 Atom Components

All atoms are located in `src/components/atoms/` and exported from `src/components/atoms/index.ts`

### Button

```typescript
import { Button } from '@/components/atoms';

// Basic button
<Button label="Click me" onClick={handleClick} />

// Primary button with loading
<Button
  label="Save Changes"
  variant="primary"
  loading={isLoading}
  onClick={handleSave}
/>

// Secondary button (outline style)
<Button
  label="Cancel"
  variant="secondary"
  onClick={handleCancel}
/>

// Danger button (delete action)
<Button
  label="Delete Account"
  variant="danger"
  onClick={handleDelete}
/>

// Ghost button (transparent)
<Button
  label="Learn More"
  variant="ghost"
/>

// Button with icon
<Button
  label="Add New"
  icon={<PlusOutlined />}
  onClick={handleAdd}
/>

// Button sizes
<Button label="Small" size="small" />
<Button label="Medium" size="medium" />
<Button label="Large" size="large" />

// Disabled button
<Button
  label="Disabled"
  disabled={true}
/>

// Full width button
<Button
  label="Submit"
  width="100%"
  onClick={handleSubmit}
/>
```

### Input

```typescript
import { Input } from '@/components/atoms';

// Text input
<Input
  label="Full Name"
  placeholder="Enter your name"
  value={name}
  onChange={setName}
/>

// Email input with error
<Input
  type="email"
  label="Email Address"
  placeholder="name@example.com"
  value={email}
  onChange={setEmail}
  error="Invalid email format"
/>

// Password input
<Input
  type="password"
  label="Password"
  placeholder="Enter password"
  value={password}
  onChange={setPassword}
/>

// Number input
<Input
  type="number"
  label="Amount"
  placeholder="0.00"
  value={amount}
  onChange={setAmount}
/>

// Date input
<Input
  type="date"
  label="Transaction Date"
  value={date}
  onChange={setDate}
/>

// Input with prefix (icon)
<Input
  prefix={<UserOutlined />}
  placeholder="Username"
  value={username}
  onChange={setUsername}
/>

// Input with suffix
<Input
  suffix={<EyeOutlined />}
  type="password"
  placeholder="Enter password"
  value={password}
  onChange={setPassword}
/>

// Required field
<Input
  label="Account Name"
  required={true}
  value={accountName}
  onChange={setAccountName}
/>

// Disabled input
<Input
  label="User ID"
  value={userId}
  disabled={true}
/>

// Input sizes
<Input placeholder="Small" size="small" />
<Input placeholder="Medium" size="medium" />
<Input placeholder="Large" size="large" />
```

### Card

```typescript
import { Card } from '@/components/atoms';

// Simple card
<Card>
  Card content goes here
</Card>

// Card with title
<Card title="Account Summary">
  Balance: $1,234.56
</Card>

// Card with title and footer
<Card
  title="Account Details"
  footer={<Button label="Edit" />}
>
  Account Type: Savings
</Card>

// Card with header action
<Card
  title="Recent Transactions"
  extra={<Button label="View All" variant="ghost" />}
>
  Transaction list here
</Card>

// Hoverable card (clickable)
<Card
  title="Click me"
  hoverable
  onClick={handleCardClick}
>
  This card responds to clicks
</Card>

// Card with custom padding
<Card padding="large">
  Large padding card
</Card>

// Card with dashed border
<Card borderStyle="dashed">
  Dashed border card
</Card>

// Card with custom background
<Card backgroundColor="#f0f5ff">
  Custom background color
</Card>
```

### Badge

```typescript
import { Badge } from '@/components/atoms';

// Basic badge
<Badge>Active</Badge>

// Success badge
<Badge color="success">Completed</Badge>

// Warning badge
<Badge color="warning">Pending Review</Badge>

// Error badge
<Badge color="error">Failed</Badge>

// Info badge
<Badge color="info">Information</Badge>

// Processing badge
<Badge color="processing">Loading...</Badge>

// Badge with icon
<Badge color="success" icon={<CheckOutlined />}>
  Verified
</Badge>

// Rounded badge
<Badge color="success" rounded>
  Active
</Badge>

// Badge sizes
<Badge size="small">Small</Badge>
<Badge size="medium">Medium</Badge>
<Badge size="large">Large</Badge>

// Custom colors
<Badge
  backgroundColor="#e8f5e9"
  textColor="#2e7d32"
>
  Custom
</Badge>
```

### Select

```typescript
import { Select } from '@/components/atoms';

// Basic select
<Select
  placeholder="Choose an option"
  options={[
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3' }
  ]}
  value={selectedValue}
  onChange={setSelectedValue}
/>

// Select with label
<Select
  label="Account Type"
  placeholder="Select account type"
  options={accountTypeOptions}
  value={accountType}
  onChange={setAccountType}
  required
/>

// Select with error
<Select
  label="Category"
  options={categoryOptions}
  value={category}
  onChange={setCategory}
  error="Please select a category"
/>

// Searchable select
<Select
  label="Search category"
  options={categoryOptions}
  value={category}
  onChange={setCategory}
  searchable={true}
  placeholder="Search..."
/>

// Clearable select
<Select
  label="Filter by account"
  options={accountOptions}
  value={account}
  onChange={setAccount}
  clearable={true}
/>

// Disabled select
<Select
  label="Disabled"
  options={options}
  disabled={true}
/>

// Select with disabled options
<Select
  options={[
    { value: 1, label: 'Available', disabled: false },
    { value: 2, label: 'Unavailable', disabled: true },
    { value: 3, label: 'Available', disabled: false }
  ]}
  value={value}
  onChange={setValue}
/>
```

### LoadingSpinner

```typescript
import { LoadingSpinner } from '@/components/atoms';

// Basic spinner
<LoadingSpinner />

// Spinner with text
<LoadingSpinner text="Loading accounts..." />

// Different sizes
<LoadingSpinner size="small" />
<LoadingSpinner size="medium" />
<LoadingSpinner size="large" />

// Different colors
<LoadingSpinner color="primary" />
<LoadingSpinner color="success" />
<LoadingSpinner color="error" />
<LoadingSpinner color="warning" />

// Full page overlay
<LoadingSpinner
  fullPage={true}
  text="Processing your request..."
  size="large"
/>
```

---

## 🧩 Molecule Components

All molecules are located in `src/components/molecules/` and exported from `src/components/molecules/index.ts`

### FormField

```typescript
import { FormField } from '@/components/molecules';

// Text input field
<FormField
  name="username"
  label="Username"
  placeholder="Enter username"
  type="input"
  value={formData.username}
  onChange={(value) => handleFieldChange('username', value)}
  required={true}
  error={errors.username}
/>

// Email field
<FormField
  name="email"
  label="Email Address"
  type="input"
  inputProps={{ type: 'email' }}
  placeholder="name@example.com"
  value={formData.email}
  onChange={(value) => handleFieldChange('email', value)}
  error={errors.email}
  helperText="We'll never share your email"
/>

// Select field
<FormField
  name="accountType"
  label="Account Type"
  type="select"
  selectProps={{
    options: [
      { value: AccountType.CASH, label: 'Cash' },
      { value: AccountType.BANK, label: 'Bank' },
      { value: AccountType.CREDIT_CARD, label: 'Credit Card' }
    ],
    searchable: true,
    clearable: true
  }}
  value={formData.accountType}
  onChange={(value) => handleFieldChange('accountType', value)}
  required={true}
/>

// Number input field
<FormField
  name="amount"
  label="Amount (VND)"
  type="input"
  inputProps={{ type: 'number' }}
  placeholder="0.00"
  value={formData.amount}
  onChange={(value) => handleFieldChange('amount', value)}
  error={errors.amount}
/>

// Password field
<FormField
  name="password"
  label="Password"
  type="input"
  inputProps={{ type: 'password' }}
  placeholder="Enter password"
  value={formData.password}
  onChange={(value) => handleFieldChange('password', value)}
  required={true}
/>

// Disabled field
<FormField
  name="userId"
  label="User ID"
  value={userId}
  disabled={true}
/>

// Field with helper text
<FormField
  name="website"
  label="Website"
  placeholder="https://example.com"
  value={formData.website}
  onChange={(value) => handleFieldChange('website', value)}
  helperText="Enter a valid URL starting with http:// or https://"
/>
```

---

## 📋 Complete Form Example

```typescript
import { useState } from 'react';
import { FormField } from '@/components/molecules';
import { Button, Card } from '@/components/atoms';
import { AccountType, CategoryType } from '@/constants/enums';

interface IFormData {
  accountName: string;
  accountType: AccountType;
  initialBalance: number;
  currency: string;
}

export const AccountFormExample: React.FC = () => {
  const [formData, setFormData] = useState<IFormData>({
    accountName: '',
    accountType: AccountType.BANK,
    initialBalance: 0,
    currency: 'VND',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: keyof IFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on field change
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }
    if (formData.initialBalance < 0) {
      newErrors.initialBalance = 'Balance cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Call API to create account
      console.log('Form submitted:', formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title="Create New Account">
      <form onSubmit={handleSubmit}>
        <FormField
          name="accountName"
          label="Account Name"
          placeholder="e.g., My Savings"
          type="input"
          value={formData.accountName}
          onChange={(value) => handleFieldChange('accountName', value as string)}
          error={errors.accountName}
          required
        />

        <FormField
          name="accountType"
          label="Account Type"
          type="select"
          selectProps={{
            options: [
              { value: AccountType.CASH, label: 'Cash' },
              { value: AccountType.BANK, label: 'Bank Account' },
              { value: AccountType.CREDIT_CARD, label: 'Credit Card' },
              { value: AccountType.DIGITAL_WALLET, label: 'Digital Wallet' },
            ],
          }}
          value={formData.accountType}
          onChange={(value) => handleFieldChange('accountType', value as AccountType)}
          required
        />

        <FormField
          name="initialBalance"
          label="Initial Balance"
          type="input"
          inputProps={{ type: 'number' }}
          placeholder="0"
          value={formData.initialBalance}
          onChange={(value) => handleFieldChange('initialBalance', value as number)}
          error={errors.initialBalance}
        />

        <FormField
          name="currency"
          label="Currency"
          type="select"
          selectProps={{
            options: [
              { value: 'VND', label: 'Vietnamese Dong (VND)' },
              { value: 'USD', label: 'US Dollar (USD)' },
              { value: 'EUR', label: 'Euro (EUR)' },
            ],
          }}
          value={formData.currency}
          onChange={(value) => handleFieldChange('currency', value as string)}
        />

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <Button
            label="Create Account"
            variant="primary"
            type="submit"
            loading={isSubmitting}
            width="50%"
          />
          <Button label="Cancel" variant="secondary" width="50%" />
        </div>
      </form>
    </Card>
  );
};
```

---

## 🔗 Redux Integration

```typescript
import { useAppDispatch, useAppSelector } from '@/hooks';
import { accountActions, selectAccounts, selectIsAccountLoading } from '@/redux/modules/accounts';

function AccountsPage() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(selectAccounts);
  const isLoading = useAppSelector(selectIsAccountLoading);

  useEffect(() => {
    // Load accounts on component mount
    dispatch(accountActions.listAccountsRequest({}));
  }, [dispatch]);

  const handleCreateAccount = (formData: ICreateAccountPayload) => {
    dispatch(accountActions.createAccountRequest(formData));
  };

  return (
    <div>
      {isLoading && <LoadingSpinner text="Loading accounts..." />}
      {accounts.map((account) => (
        <Card key={account.id} title={account.name}>
          Balance: {formatCurrency(account.balance)}
        </Card>
      ))}
      <AccountForm onSubmit={handleCreateAccount} />
    </div>
  );
}
```

---

## 💡 Tips & Best Practices

1. **Always use FormField for forms** - It handles label, error, and validation
2. **Use Redux selectors** - Never access state directly, always use memoized selectors
3. **Type your components** - All components are fully typed with TypeScript
4. **Error handling** - Show errors immediately when validation fails
5. **Loading states** - Always show loading spinner during async operations
6. **Consistent sizing** - Use predefined sizes (small, medium, large)
7. **Accessibility** - All components include proper ARIA attributes

---

**Last Updated**: November 19, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅

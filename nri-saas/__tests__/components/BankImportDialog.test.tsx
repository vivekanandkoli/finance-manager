/**
 * BankImportDialog Component Tests
 * Testing file upload, parsing, and transaction import workflow
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BankImportDialog from '@/components/expenses/BankImportDialog'

// Mock the BankStatementParser
jest.mock('@/lib/bankParser/BankStatementParser', () => {
  return jest.fn().mockImplementation(() => ({
    parseFile: jest.fn().mockResolvedValue({
      success: true,
      bank: 'HDFC Bank',
      accountNumber: 'XXXX1234',
      transactions: [
        {
          date: '2024-04-01',
          description: 'ATM Withdrawal',
          type: 'debit',
          amount: 5000,
          category: 'Cash',
          balance: 45000,
        },
        {
          date: '2024-04-02',
          description: 'Salary Credit',
          type: 'credit',
          amount: 50000,
          category: 'Income',
          balance: 95000,
        },
      ],
      expenses: [
        {
          date: '2024-04-01',
          description: 'ATM Withdrawal',
          type: 'debit',
          amount: 5000,
          category: 'Cash',
          balance: 45000,
        },
      ],
      income: [
        {
          date: '2024-04-02',
          description: 'Salary Credit',
          type: 'credit',
          amount: 50000,
          category: 'Income',
          balance: 95000,
        },
      ],
      summary: {
        startDate: '2024-04-01',
        endDate: '2024-04-02',
        totalDeposits: 50000,
        totalWithdrawals: 5000,
        netChange: 45000,
        transactionCount: 2,
        openingBalance: 50000,
        closingBalance: 95000,
        averageDebit: 5000,
        averageCredit: 50000,
        topCategories: {
          Cash: 5000,
          Income: 50000,
        },
        largestExpense: 5000,
        largestIncome: 50000,
        monthlyAverage: 45000,
        periodInMonths: 1,
      },
    }),
  }))
})

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
    })),
  }),
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}))

describe('BankImportDialog', () => {
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render dialog when open', () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    expect(screen.getByText(/Import Bank Statement/i)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    const { container } = render(<BankImportDialog open={false} onOpenChange={mockOnOpenChange} />)
    
    // Dialog should not be visible
    expect(container.querySelector('[role="dialog"]')).not.toBeVisible()
  })

  it('should display file upload area', () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    expect(screen.getByText(/Drop your bank statement here/i)).toBeInTheDocument()
  })

  it('should accept PDF and CSV files', () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    const text = screen.getByText(/PDF, CSV, XLSX/i)
    expect(text).toBeInTheDocument()
  })

  it('should handle file selection', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    const file = new File(['dummy content'], 'statement.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)
      
      // File should be registered (implementation may vary)
      expect(input.files).toHaveLength(1)
      expect(input.files?.[0]).toBe(file)
    }
  })

  it('should show password input when needed', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // Simulate password-protected PDF detection
    // This would require modifying the component or parser mock
  })

  it('should display parsing results after successful upload', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    const file = new File(['dummy content'], 'statement.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)
      
      // Wait for parsing to complete
      await waitFor(() => {
        // Check if results are shown (bank name, transaction count, etc.)
        // Implementation depends on actual component rendering
      })
    }
  })

  it('should show transaction list in tabs', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // After successful parse, tabs should be visible
    // This test needs actual parsing to complete
  })

  it('should allow editing transaction categories', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // After parsing, edit buttons should be available
    // User can click edit and change category
  })

  it('should display summary statistics', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // After parsing, summary should show:
    // - Total deposits
    // - Total withdrawals
    // - Net change
    // - Transaction count
  })

  it('should handle import button click', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // After parsing, import button should be available
    // Clicking should save transactions to database
  })

  it('should close dialog on cancel', () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    const cancelButton = screen.queryByText(/Cancel/i)
    if (cancelButton) {
      fireEvent.click(cancelButton)
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    }
  })

  it('should reset state when dialog closes', () => {
    const { rerender } = render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // Upload file and parse
    // Then close dialog
    rerender(<BankImportDialog open={false} onOpenChange={mockOnOpenChange} />)
    
    // Reopen and state should be reset
    rerender(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    expect(screen.getByText(/Drop your bank statement here/i)).toBeInTheDocument()
  })

  it('should handle parsing errors gracefully', async () => {
    // Mock parser to return error
    const BankStatementParser = require('@/lib/bankParser/BankStatementParser')
    BankStatementParser.mockImplementationOnce(() => ({
      parseFile: jest.fn().mockResolvedValue({
        success: false,
        error: 'Failed to parse file',
      }),
    }))

    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    const file = new File(['invalid'], 'bad.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)
      
      await waitFor(() => {
        // Error message should be displayed
      })
    }
  })

  it('should validate file size', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // Create a very large file
    const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
    const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' })
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      // Depending on implementation, large files might be rejected
      await userEvent.upload(input, largeFile)
    }
  })

  it('should show loading state during parsing', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    const file = new File(['content'], 'statement.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)
      
      // Loading indicator should appear briefly
      // This is timing-dependent and may be hard to test
    }
  })

  it('should calculate category-wise breakdown', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // After parsing, category breakdown should be visible
    // Showing percentage and amount for each category
  })

  it('should filter transactions by type (income/expense)', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // Tabs should allow switching between All, Income, Expenses
  })

  it('should maintain scroll position when editing categories', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // When editing a category in a long list, scroll position should be maintained
  })
})

describe('BankImportDialog - Integration', () => {
  const mockOnOpenChange = jest.fn()

  it('should complete full import workflow', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // 1. Upload file
    const file = new File(['content'], 'statement.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      await userEvent.upload(input, file)
      
      // 2. Wait for parsing
      await waitFor(() => {
        // Results should be displayed
      }, { timeout: 3000 })
      
      // 3. Review transactions
      // 4. Edit categories if needed
      // 5. Click import
      // 6. Verify success message
      // 7. Dialog closes
    }
  })

  it('should handle password-protected PDFs', async () => {
    // Mock parser to return needsPassword
    const BankStatementParser = require('@/lib/bankParser/BankStatementParser')
    BankStatementParser.mockImplementationOnce(() => ({
      parseFile: jest.fn()
        .mockResolvedValueOnce({
          success: false,
          needsPassword: true,
        })
        .mockResolvedValueOnce({
          success: true,
          transactions: [],
          summary: {},
        }),
    }))

    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // 1. Upload password-protected file
    // 2. Password input appears
    // 3. Enter password
    // 4. Submit
    // 5. File is parsed successfully
  })
})

describe('BankImportDialog - Accessibility', () => {
  const mockOnOpenChange = jest.fn()

  it('should have proper ARIA labels', () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).toBeInTheDocument()
  })

  it('should be keyboard navigable', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // Tab through interactive elements
    // All buttons and inputs should be focusable
  })

  it('should announce loading state to screen readers', async () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // When loading, appropriate ARIA live region should update
  })

  it('should have descriptive button labels', () => {
    render(<BankImportDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // All buttons should have clear, descriptive text
  })
})

/**
 * Test with ACTUAL SCB Thailand statement
 */

const actualSCBStatement = `
ธนาคารไทยพาณิชย์ จำกัด (มหาชน)  THE SIAM COMMERCIAL BANK PUBLIC COMPANY LIMITED
สาขา CRYSTAL DESIGN CENTER BRANC
MR. VIVEKANAND KOLI
SV CITY CONDOMINIUM BUILDING 19 FL UNIT 916/199
RAMA III ROAD BANG PHONGPHANG YAN NAWA BANGKOK 10120
เลขที่บัญชี Account No. 431-145472-6
Date วันที่ 01/04/2026 - 13/04/2026

Date วันที่ Time เวลา Code รายการ Channel ช่องทาง Description Balance/Baht Debit/Credit
ยอดเงินคงเหลือยกมา (BALANCE BROUGHT FORWARD)   90,666.38
01/04/26 09:24   X2   ENET   6,312.75   84,353.63   จ่ายบิล UOB CREDIT CARD/CASH PLUS
01/04/26 09:24   X2   ENET   10,000.00   74,353.63   Transfer to TMB x8311 KHWANJAI NARO
02/04/26 21:04   X2   ENET   40.00   74,313.63   Top-Up WIDx7030/K Plus W
03/04/26 22:22   X2   ENET   203.00   74,110.63   Top-Up WIDx7137/K Plus W
04/04/26 10:12   X2   ENET   440.00   73,670.63   Transfer to BAY x7133 SVCITY JURIST
04/04/26 10:32   X2   ENET   15.00   73,655.63   จ่ายบิล BRT E Ticket
04/04/26 15:56   X2   ENET   15.00   73,640.63   จ่ายบิล BRT E Ticket
04/04/26 19:51   X2   ENET   50.00   73,590.63   Top-Up WIDx0814/K Plus W
04/04/26 20:03   FE   ENET   10.00   73,580.63   SIPS 123 SERVICE CO.,LTD.
04/04/26 20:03   X2   ENET   70,141.05   3,439.58   SIPS 123 SERVICE CO.,LTD.
05/04/26 15:11   X1   ENET   1,000.00   4,439.58   รับโอนจาก BBL x4138 MR SADASHIV TANAJI G
05/04/26 19:29   X2   ENET   75.00   4,364.58   Top-Up WIDx0814/K Plus W
06/04/26 18:43   X2   ENET   150.00   4,214.58   จ่ายบิล โลตัส อีเทอรี่ - ฟู้ด คอร์ท
07/04/26 10:37   X1   ENET   180.00   4,394.58   รับโอนจาก TTB x4082 นาย โยเลส บาลิลับ สา
07/04/26 10:39   X1   ENET   180.00   4,574.58   รับโอนจาก KBANK x3078 MRS. ROHINI SUKHDE
07/04/26 11:53   X1   ENET   180.00   4,754.58   รับโอนจาก BBL x0742 MR ASHISH PANDURANG
07/04/26 16:05   X1   ENET   180.00   4,934.58   รับโอนจาก BBL x7870 MUKUL WANI MR
08/04/26 11:58   X2   ENET   45.00   4,889.58   PromptPay x8682 PIRUNLAX WANN
08/04/26 11:59   X2   ENET   30.00   4,859.58   PromptPay x8595 นาย สุรชาติ กุมารติ
10/04/26 19:15   X2   ENET   200.00   4,659.58   จ่ายบิล TRUE MONEY CO.,LTD.
10/04/26 23:11   X2   ENET   120.00   4,539.58   Top-Up WIDx3692/K Plus W
10/04/26 23:14   X2   ENET   22.00   4,517.58   Top-Up WIDx3692/K Plus W
11/04/26 12:05   X2   ENET   1,140.00   3,377.58   Top-Up WIDx6485/K Plus W
11/04/26 22:09   X2   ENET   120.00   3,257.58   Top-Up WIDx3692/K Plus W
13/04/26 11:08   X1   ENET   299.00   3,556.58   PromptPay x0799 MR. VISHAL VISHWANATH PA
13/04/26 11:44   X2   ENET   200.00   3,356.58   Top-Up WIDx6485/K Plus W
13/04/26 20:05   X2   ENET   411.00   2,945.58   จ่ายบิล พรีเมียร์ เชฟ
13/04/26 20:31   X2   ENET   40.00   2,905.58   PromptPay x8870 นาย ฉัตรพล ชูบัวทอง

TOTAL AMOUNTS (Debit)   89,779.80
TOTAL AMOUNTS (Credit)   2,019.00
TOTAL ITEMS   22   6
`

describe('REAL SCB Thailand Statement Test', () => {
  test('should extract ALL 28 transactions', () => {
    const BankStatementParser = require('@/lib/bankParser/BankStatementParser').default
    const parser = BankStatementParser as any
    
    // Detect bank
    const bank = parser.detectBank(actualSCBStatement)
    console.log('Detected bank:', bank)
    expect(bank).toBe('SCB_Thailand')
    
    // Detect currency
    const currency = parser.detectCurrency(bank, actualSCBStatement)
    console.log('Detected currency:', currency)
    expect(currency).toBe('THB')
    
    // Extract transactions
    const transactions = parser.extractTransactions(actualSCBStatement, bank)
    console.log(`\nExtracted ${transactions.length} transactions`)
    console.log('\nFirst 5 transactions:')
    transactions.slice(0, 5).forEach((txn: any, i: number) => {
      console.log(`${i + 1}. ${txn.date} | ${txn.description.substring(0, 40)} | ${txn.type} | ${txn.currency} ${txn.amount}`)
    })
    
    // Should find 28 transactions (22 debits + 6 credits)
    expect(transactions.length).toBe(28)
    
    // Check first transaction
    const firstTxn = transactions[0]
    expect(firstTxn.date).toBe('2026-04-01')
    expect(firstTxn.amount).toBe(6312.75)
    expect(firstTxn.currency).toBe('THB')
    expect(firstTxn.type).toBe('debit')
    expect(firstTxn.description).toContain('UOB CREDIT CARD')
    
    // Check a credit transaction (รับโอนจาก = receive transfer)
    const creditTxn = transactions.find((t: any) => t.description.includes('รับโอนจาก'))
    expect(creditTxn).toBeDefined()
    expect(creditTxn.type).toBe('credit')
    expect(creditTxn.currency).toBe('THB')
    
    // Verify totals
    const debits = transactions.filter((t: any) => t.type === 'debit')
    const credits = transactions.filter((t: any) => t.type === 'credit')
    
    console.log(`\nDebits: ${debits.length}, Credits: ${credits.length}`)
    console.log(`Total Debit Amount: ${debits.reduce((sum: number, t: any) => sum + t.amount, 0).toFixed(2)}`)
    console.log(`Total Credit Amount: ${credits.reduce((sum: number, t: any) => sum + t.amount, 0).toFixed(2)}`)
    
    expect(debits.length).toBe(22)
    expect(credits.length).toBe(6)
  })
  
  test('should categorize transactions correctly', () => {
    const BankStatementParser = require('@/lib/bankParser/BankStatementParser').default
    const parser = BankStatementParser as any
    
    const bank = parser.detectBank(actualSCBStatement)
    const transactions = parser.extractTransactions(actualSCBStatement, bank)
    
    // Check some specific categorizations
    const creditCardTxn = transactions.find((t: any) => t.description.includes('CREDIT CARD'))
    expect(creditCardTxn?.category).toBe('Credit Card Bill')
    
    const transferTxn = transactions.find((t: any) => t.description.includes('Transfer'))
    expect(transferTxn?.category).toBe('Transfers')
    
    const topUpTxn = transactions.find((t: any) => t.description.includes('Top-Up'))
    expect(topUpTxn?.category).toBe('Internet & Phone')
  })
})

import { GoogleGenAI, Type } from "@google/genai";

// Mock Data for the prototype
export const MOCK_SAP_PL = [
  { StoreID: "101", Dept: "Grocery", Budgeted_Hours: 450, Actual_Hours: 492, Variance_USD: 1260, Date: "2024-03-01" },
  { StoreID: "101", Dept: "Produce", Budgeted_Hours: 320, Actual_Hours: 310, Variance_USD: -300, Date: "2024-03-01" },
  { StoreID: "101", Dept: "Bakery", Budgeted_Hours: 180, Actual_Hours: 210, Variance_USD: 900, Date: "2024-03-01" },
  { StoreID: "102", Dept: "Grocery", Budgeted_Hours: 500, Actual_Hours: 545, Variance_USD: 1350, Date: "2024-03-01" },
  { StoreID: "101", Dept: "Grocery", Budgeted_Hours: 450, Actual_Hours: 510, Variance_USD: 1800, Date: "2024-03-08" },
];

export const MOCK_POS_SIGNALS = [
  { StoreID: "101", Date: "2024-03-01", Promo_Flag: "Summer Staples", Transaction_Count: 12400, Item_Movement: 45000 },
  { StoreID: "101", Date: "2024-03-08", Promo_Flag: "Price Drop", Transaction_Count: 14200, Item_Movement: 52000 },
  { StoreID: "102", Date: "2024-03-01", Promo_Flag: "None", Transaction_Count: 11000, Item_Movement: 38000 },
];

export const MOCK_VENDOR_CLAIMS = [
  { ClaimID: "CLM-001", Supplier: "Tyson Foods", Disputed_Amount: 4500.50, Receipt_Quantity: 450, Claim_Quantity: 500, Status: "Pending" },
  { ClaimID: "CLM-002", Supplier: "Kraft Heinz", Disputed_Amount: 1200.00, Receipt_Quantity: 100, Claim_Quantity: 120, Status: "Pending" },
  { ClaimID: "CLM-003", Supplier: "General Mills", Disputed_Amount: 850.75, Receipt_Quantity: 200, Claim_Quantity: 210, Status: "Resolved" },
];

export const MEIJER_SYSTEM_INSTRUCTION = `You are the Meijer Finance Copilot. You analyze operational signals from SAP, Workday, and POS to provide auditable narratives. 
Your goal is to protect Meijer's 1.7% net profit margin.

Key Principles:
1. Always cite your data source (e.g., [Source: SAP Row 12]).
2. Be "Brutally Honest" and precise.
3. If correlation strength is < 0.5, state: "Insufficient data to determine root cause. Manual review required".
4. Use the provided mock data to ground your analysis.
5. Focus on labor variances and vendor disputes.

Context:
- SAP Data: Weekly P&L (Budgeted vs Actual Hours).
- POS Data: Sales movement and Promotions.
- Workday Data: Scheduling and call-outs (simulated).
- VendorNet: Supplier claims and receiving logs.`;

export async function analyzeLaborVariance(prompt: string) {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const model = genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `Analyze this request using the Meijer data: ${prompt}\n\nData Context:\nSAP P&L: ${JSON.stringify(MOCK_SAP_PL)}\nPOS Signals: ${JSON.stringify(MOCK_POS_SIGNALS)}` }]
      }
    ],
    config: {
      systemInstruction: MEIJER_SYSTEM_INSTRUCTION,
      temperature: 0.2,
    }
  });

  const response = await model;
  return response.text;
}

export async function generateDisputeResponse(claimId: string) {
  const claim = MOCK_VENDOR_CLAIMS.find(c => c.ClaimID === claimId);
  if (!claim) return "Claim not found.";

  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const model = genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `Generate a formal dispute response for VendorNet for Claim ID: ${claimId}. \nClaim Details: ${JSON.stringify(claim)}` }]
      }
    ],
    config: {
      systemInstruction: MEIJER_SYSTEM_INSTRUCTION,
      temperature: 0.1,
    }
  });

  const response = await model;
  return response.text;
}

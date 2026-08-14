/**
 * Time-Locked Escrow Wallet for P2P Ticket Resales (#17694)
 * 
 * Smart contract integration for secure peer-to-peer ticket transfers.
 * Implements atomic ticket-money swaps with time-locked refund policies.
 */

/**
 * Escrow contract ABI definition for the time-locked escrow wallet
 */
export const ESCROW_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_ticketContract", type: "address" },
      { internalType: "uint256", name: "_timeoutDuration", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "uint256", name: "ticketId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "createEscrow",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "escrowId", type: "uint256" }],
    name: "confirmTicketReceipt",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "escrowId", type: "uint256" }],
    name: "releaseFunds",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "escrowId", type: "uint256" }],
    name: "claimRefund",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "escrowId", type: "uint256" }],
    name: "getEscrowDetails",
    outputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "uint256", name: "ticketId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "uint256", name: "timeoutAt", type: "uint256" },
      { internalType: "bool", name: "ticketConfirmed", type: "bool" },
      { internalType: "bool", name: "fundsReleased", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTimeoutDuration",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

/**
 * Escrow status constants
 */
export const EscrowStatus = {
  PENDING: "PENDING",
  TICKET_CONFIRMED: "TICKET_CONFIRMED",
  FUNDS_RELEASED: "FUNDS_RELEASED",
  REFUNDED: "REFUNDED",
  EXPIRED: "EXPIRED"
};

/**
 * Escrow Wallet Manager
 * Manages time-locked escrow transactions for P2P ticket resales
 */
export class EscrowWalletManager {
  constructor(contractAddress, provider, signer = null) {
    this.contractAddress = contractAddress;
    this.provider = provider;
    this.signer = signer;
    this.escrows = new Map();
    this.nextEscrowId = 1;
  }

  /**
   * Create a new escrow transaction
   * @param {string} seller - Seller's wallet address
   * @param {string} buyer - Buyer's wallet address
   * @param {number|string} ticketId - ID of the ticket being sold
   * @param {number|string} amount - Amount in wei (or ETH string)
   * @param {number} timeoutMinutes - Timeout duration in minutes
   * @returns {Promise<Object>} - Escrow transaction details
   */
  async createEscrow(seller, buyer, ticketId, amount, timeoutMinutes = 60) {
    const escrowId = this.nextEscrowId++;
    const timeoutAt = Date.now() + (timeoutMinutes * 60 * 1000);

    const escrow = {
      id: escrowId,
      seller,
      buyer,
      ticketId: typeof ticketId === 'number' ? ticketId : parseInt(ticketId),
      amount: typeof amount === 'number' ? amount : this.parseEther(amount),
      createdAt: Date.now(),
      timeoutAt,
      ticketConfirmed: false,
      fundsReleased: false,
      refunded: false,
      status: EscrowStatus.PENDING
    };

    this.escrows.set(escrowId, escrow);

    // Simulate blockchain transaction hash
    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    return {
      success: true,
      escrowId,
      transactionHash: txHash,
      timeoutAt,
      message: "Escrow created successfully. Buyer funds are now locked."
    };
  }

  /**
   * Confirm that the buyer has received the valid ticket
   * This triggers the time-lock countdown
   * @param {number} escrowId - ID of the escrow
   * @param {string} buyerAddress - Address of the buyer confirming
   * @returns {Promise<Object>} - Confirmation result
   */
  async confirmTicketReceipt(escrowId, buyerAddress) {
    const escrow = this.escrows.get(escrowId);

    if (!escrow) {
      throw new Error(`Escrow not found: ${escrowId}`);
    }

    if (escrow.buyer.toLowerCase() !== buyerAddress.toLowerCase()) {
      throw new Error("Only the buyer can confirm ticket receipt");
    }

    if (escrow.status !== EscrowStatus.PENDING) {
      throw new Error(`Escrow is not in PENDING state: ${escrow.status}`);
    }

    // Update escrow state
    escrow.ticketConfirmed = true;
    escrow.status = EscrowStatus.TICKET_CONFIRMED;

    return {
      success: true,
      escrowId,
      confirmedAt: Date.now(),
      timeoutAt: escrow.timeoutAt,
      message: "Ticket receipt confirmed. Funds will be released after verification or timeout."
    };
  }

  /**
   * Release funds to the seller after ticket verification
   * @param {number} escrowId - ID of the escrow
   * @param {string} sellerAddress - Address of the seller
   * @returns {Promise<Object>} - Release result
   */
  async releaseFunds(escrowId, sellerAddress) {
    const escrow = this.escrows.get(escrowId);

    if (!escrow) {
      throw new Error(`Escrow not found: ${escrowId}`);
    }

    if (escrow.seller.toLowerCase() !== sellerAddress.toLowerCase()) {
      throw new Error("Only the seller can release funds");
    }

    if (escrow.status !== EscrowStatus.TICKET_CONFIRMED) {
      throw new Error(`Escrow must have ticket confirmed first. Current: ${escrow.status}`);
    }

    if (escrow.fundsReleased) {
      throw new Error("Funds already released for this escrow");
    }

    // Simulate fund transfer
    escrow.fundsReleased = true;
    escrow.status = EscrowStatus.FUNDS_RELEASED;

    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    return {
      success: true,
      escrowId,
      releasedAt: Date.now(),
      transactionHash: txHash,
      amount: escrow.amount,
      to: escrow.seller,
      message: "Funds released to seller successfully."
    };
  }

  /**
   * Allow buyer to claim refund if ticket was not received or is invalid
   * Can only be called before timeout expires
   * @param {number} escrowId - ID of the escrow
   * @param {string} buyerAddress - Address of the buyer
   * @returns {Promise<Object>} - Refund result
   */
  async claimRefund(escrowId, buyerAddress) {
    const escrow = this.escrows.get(escrowId);

    if (!escrow) {
      throw new Error(`Escrow not found: ${escrowId}`);
    }

    if (escrow.buyer.toLowerCase() !== buyerAddress.toLowerCase()) {
      throw new Error("Only the buyer can claim refund");
    }

    if (escrow.status !== EscrowStatus.PENDING) {
      throw new Error(`Cannot claim refund. Current status: ${escrow.status}`);
    }

    if (Date.now() > escrow.timeoutAt) {
      throw new Error("Timeout expired. Refund period has ended.");
    }

    // Process refund
    escrow.refunded = true;
    escrow.status = EscrowStatus.REFUNDED;

    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    return {
      success: true,
      escrowId,
      refundedAt: Date.now(),
      transactionHash: txHash,
      amount: escrow.amount,
      to: escrow.buyer,
      message: "Refund claimed successfully. Funds returned to buyer."
    };
  }

  /**
   * Automatically release funds after timeout if ticket was confirmed
   * This is called by the system after the timeout period
   * @param {number} escrowId - ID of the escrow
   * @returns {Promise<Object>} - Auto-release result
   */
  async autoReleaseAfterTimeout(escrowId) {
    const escrow = this.escrows.get(escrowId);

    if (!escrow) {
      return { success: false, error: "Escrow not found" };
    }

    if (escrow.status !== EscrowStatus.TICKET_CONFIRMED) {
      return { success: false, error: `Escrow not ready for auto-release. Status: ${escrow.status}` };
    }

    if (Date.now() < escrow.timeoutAt) {
      return { success: false, error: "Timeout not yet reached" };
    }

    if (escrow.fundsReleased) {
      return { success: false, error: "Funds already released" };
    }

    // Auto-release funds to seller
    escrow.fundsReleased = true;
    escrow.status = EscrowStatus.FUNDS_RELEASED;

    const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    return {
      success: true,
      escrowId,
      releasedAt: Date.now(),
      transactionHash: txHash,
      amount: escrow.amount,
      to: escrow.seller,
      message: "Auto-release: Funds released to seller after timeout."
    };
  }

  /**
   * Get details of a specific escrow
   * @param {number} escrowId - ID of the escrow
   * @returns {Object|null} - Escrow details or null if not found
   */
  getEscrowDetails(escrowId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) {
      return null;
    }

    return {
      ...escrow,
      timeRemaining: escrow.timeoutAt - Date.now(),
      isExpired: Date.now() > escrow.timeoutAt
    };
  }

  /**
   * List all escrows for a specific user (buyer or seller)
   * @param {string} address - Wallet address
   * @returns {Array} - List of escrows
   */
  getEscrowsByAddress(address) {
    const addressLower = address.toLowerCase();
    return Array.from(this.escrows.values())
      .filter(e => 
        e.seller.toLowerCase() === addressLower || 
        e.buyer.toLowerCase() === addressLower
      )
      .map(escrow => ({
        ...escrow,
        timeRemaining: escrow.timeoutAt - Date.now(),
        isExpired: Date.now() > escrow.timeoutAt,
        isSeller: escrow.seller.toLowerCase() === addressLower,
        isBuyer: escrow.buyer.toLowerCase() === addressLower
      }));
  }

  /**
   * Utility to parse ETH string to wei
   * @param {string} ether - ETH amount as string
   * @returns {number} - Amount in wei
   */
  parseEther(ether) {
    const ethValue = parseFloat(ether);
    return Math.round(ethValue * 1e18);
  }

  /**
   * Utility to format wei to ETH string
   * @param {number|string} wei - Amount in wei
   * @returns {string} - ETH amount as string
   */
  formatEther(wei) {
    const weiValue = typeof wei === 'string' ? parseInt(wei) : wei;
    return (weiValue / 1e18).toFixed(18);
  }

  /**
   * Validate escrow parameters before creation
   * @param {string} seller - Seller address
   * @param {string} buyer - Buyer address
   * @param {number|string} amount - Amount
   * @param {number} timeoutMinutes - Timeout duration
   * @returns {Object} - Validation result
   */
  validateEscrowParams(seller, buyer, amount, timeoutMinutes = 60) {
    const errors = [];

    if (!seller || !this.isValidAddress(seller)) {
      errors.push("Invalid seller address");
    }

    if (!buyer || !this.isValidAddress(buyer)) {
      errors.push("Invalid buyer address");
    }

    if (seller.toLowerCase() === buyer.toLowerCase()) {
      errors.push("Seller and buyer cannot be the same address");
    }

    if (typeof amount === 'string') {
      try {
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed <= 0) {
          errors.push("Amount must be a positive number");
        }
      } catch {
        errors.push("Invalid amount format");
      }
    } else if (typeof amount === 'number') {
      if (amount <= 0) {
        errors.push("Amount must be positive");
      }
    } else {
      errors.push("Amount must be a number or string");
    }

    if (timeoutMinutes < 5 || timeoutMinutes > 1440) {
      errors.push("Timeout must be between 5 and 1440 minutes (24 hours)");
    }

    return {
      valid: errors.length === 0,
      errors,
      parsedAmount: typeof amount === 'string' ? this.parseEther(amount) : amount
    };
  }

  /**
   * Simple address validation (Ethereum address format)
   * @param {string} address - Address to validate
   * @returns {boolean} - True if valid format
   */
  isValidAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }
    // Simple check for Ethereum address format
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  }

  /**
   * Check if an escrow can be cancelled (refunded)
   * @param {number} escrowId - ID of the escrow
   * @param {string} requesterAddress - Address requesting cancellation
   * @returns {Object} - Eligibility result
   */
  canClaimRefund(escrowId, requesterAddress) {
    const escrow = this.escrows.get(escrowId);

    if (!escrow) {
      return { eligible: false, reason: "Escrow not found" };
    }

    if (escrow.buyer.toLowerCase() !== requesterAddress.toLowerCase()) {
      return { eligible: false, reason: "Only buyer can claim refund" };
    }

    if (escrow.status !== EscrowStatus.PENDING) {
      return { eligible: false, reason: `Escrow status is ${escrow.status}` };
    }

    if (Date.now() > escrow.timeoutAt) {
      return { eligible: false, reason: "Timeout expired" };
    }

    return { eligible: true, reason: "Eligible for refund" };
  }

  /**
   * Check if funds can be released for an escrow
   * @param {number} escrowId - ID of the escrow
   * @param {string} requesterAddress - Address requesting release
   * @returns {Object} - Eligibility result
   */
  canReleaseFunds(escrowId, requesterAddress) {
    const escrow = this.escrows.get(escrowId);

    if (!escrow) {
      return { eligible: false, reason: "Escrow not found" };
    }

    if (escrow.seller.toLowerCase() !== requesterAddress.toLowerCase()) {
      return { eligible: false, reason: "Only seller can release funds" };
    }

    if (escrow.status !== EscrowStatus.TICKET_CONFIRMED) {
      return { eligible: false, reason: `Ticket not confirmed. Status: ${escrow.status}` };
    }

    if (escrow.fundsReleased) {
      return { eligible: false, reason: "Funds already released" };
    }

    return { eligible: true, reason: "Eligible for fund release" };
  }

  /**
   * Clean up completed escrows (for testing/memory management)
   * @param {number} maxAgeHours - Maximum age in hours for completed escrows
   */
  cleanupCompletedEscrows(maxAgeHours = 24) {
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    const completedStatuses = [EscrowStatus.FUNDS_RELEASED, EscrowStatus.REFUNDED];

    for (const [id, escrow] of this.escrows) {
      if (completedStatuses.includes(escrow.status) && escrow.releasedAt < cutoff) {
        this.escrows.delete(id);
      }
    }
  }
}

/**
 * Default export for the escrow contract manager
 */
export default EscrowWalletManager;

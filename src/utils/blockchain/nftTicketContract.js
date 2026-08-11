/**
 * EVM NFT Ticket & ERC-2981 Secondary Royalties Engine (#14074)
 */

export function calculateSecondaryRoyalties(salePrice, royaltyBps = 1000) {
  // 1000 bps = 10%
  const royaltyAmount = (salePrice * royaltyBps) / 10000;
  return {
    royaltyAmount: Math.round(royaltyAmount * 100) / 100,
    organizerShare: Math.round(royaltyAmount * 100) / 100,
    sellerProceeds: Math.round((salePrice - royaltyAmount) * 100) / 100,
  };
}

export function verifyResalePriceCap(listPrice, originalFaceValue, maxMarkupPercent = 10) {
  const maxAllowedPrice = originalFaceValue * (1 + maxMarkupPercent / 100);
  return {
    isValid: listPrice <= maxAllowedPrice,
    maxAllowedPrice: Math.round(maxAllowedPrice * 100) / 100,
    markupAmount: Math.round((listPrice - originalFaceValue) * 100) / 100,
  };
}

export class NftTicketContractManager {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
    this.ticketsStore = new Map();
  }

  mintTicket(walletAddress, tokenId, metadataUri) {
    this.ticketsStore.set(tokenId, {
      owner: walletAddress,
      tokenId,
      metadataUri,
      faceValueEth: 0.05,
      mintedAt: new Date().toISOString(),
    });
    return {
      transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...minted`,
      tokenId,
    };
  }

  getTicketInfo(tokenId) {
    return this.ticketsStore.get(tokenId) || null;
  }
}

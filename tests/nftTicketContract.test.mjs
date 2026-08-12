import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateSecondaryRoyalties,
  verifyResalePriceCap,
  NftTicketContractManager,
} from "../src/utils/blockchain/nftTicketContract.js";

describe("EVM NFT Ticket Secondary Royalties & Resale Cap Tests", () => {
  it("should calculate 10% secondary royalties correctly", () => {
    const split = calculateSecondaryRoyalties(150, 1000); // $150 listing price, 1000 bps = 10%
    assert.equal(split.royaltyAmount, 15);
    assert.equal(split.sellerProceeds, 135);
  });

  it("should validate and enforce resale price cap markup of 10%", () => {
    const validResale = verifyResalePriceCap(105, 100, 10); // $105 list price, $100 face value, 10% max markup
    const invalidResale = verifyResalePriceCap(120, 100, 10); // $120 list price

    assert.equal(validResale.isValid, true);
    assert.equal(invalidResale.isValid, false);
  });

  it("should simulate NFT minting operations on EVM chains", () => {
    const manager = new NftTicketContractManager("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    const result = manager.mintTicket("0xRecipientWalletAddress", 101, "ipfs://metadata-uri");

    assert.ok(result.transactionHash);
    const ticket = manager.getTicketInfo(101);
    assert.equal(ticket.owner, "0xRecipientWalletAddress");
  });
});

import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/dragoncore/dragoncore";
import { Account, Collectible, Collection } from "../generated/schema";
import {
  getOrCreateAccount,
  getOrCreateCollection,
  getOrCreateCollectible,
} from "./helpers/dragoncore-utils";

export function handleTransfer(event: Transfer): void {
  let collection = getOrCreateCollection(event.address);
  let receiver = getOrCreateAccount(event.params._to);

  if (
    event.params._from ==
    Address.fromString("0x0000000000000000000000000000000000000000")
  ) {
    // THIS IS A MINT
    getOrCreateCollectible(
      Address.fromBytes(collection.collectionAddress),
      collection.id,
      event.params._tokenId,
      receiver.id,
      event.block.timestamp
    );
  } else {
    let collectibleId = collection.collectionAddress;
    // .toHexString()
    // .concat("-")
    // .concat(event.params._tokenId.toHexString());
    let collectible = Collectible.load(collectibleId.toString());
    if (collectible) {
      if (
        event.params._to ==
        Address.fromString("0x0000000000000000000000000000000000000000")
      ) {
        // THIS IS A BURN
        collectible.removed = event.block.timestamp;
      } else {
        let sender = getOrCreateAccount(event.params._from);
        collectible.owner = sender.id;
        collectible.modified = event.block.timestamp;
      }
      collectible.save();
    }
  }
}

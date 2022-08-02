import { Address, BigInt } from "@graphprotocol/graph-ts";
import { dragoncore, Transfer } from "../../generated/dragoncore/dragoncore";
import { Account, Collectible, Collection } from "../../generated/schema";

export function getOrCreateAccount(address: Address): Account {
  let account = Account.load(address.toHexString());
  if (account == null) {
    account = new Account(address.toHexString());
    account.save();
  }
  return account;
}

export function getOrCreateCollection(address: Address): Collection {
  let collection = Collection.load(address.toHexString());
  if (collection == null) {
    collection = new Collection(address.toHexString());
    collection.save();

    let contract = dragoncore.bind(address);
    let nameResult = contract.try_name();
    if (!nameResult.reverted) {
      collection.collectionName = nameResult.value;
    }

    let symbolResult = contract.try_symbol();
    if (!symbolResult.reverted) {
      collection.collectionSymbol = symbolResult.value;
    }
  }
  return collection;
}

export function getOrCreateCollectible(
  collectionAddress: Address,
  collectionId: string,
  tokenId: BigInt,
  creatorId: string,
  createdTimestamp: BigInt
): Collectible {
  let collectibleId = collectionAddress
    .toHexString()
    .concat("-")
    .concat(tokenId.toHexString());

  let collectible = Collectible.load(collectibleId);
  if (!collectible) {
    collectible = new Collectible(collectibleId);
    collectible.tokenId = tokenId;
    collectible.collection = collectionId;
    collectible.creator = creatorId;
    collectible.owner = creatorId;
    collectible.created = createdTimestamp;
    collectible.descriptorUri = dragoncore
      .bind(Address.fromBytes(collectionAddress))
      .tokenURI(tokenId);
    collectible.save();
  }
  return collectible;
}

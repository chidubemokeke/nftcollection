import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { dragoncore, Transfer } from "../../generated/dragoncore/dragoncore";
import { Account, Collectible, Collection } from "../../generated/schema";

export function getOrCreateAccount(address: Address): Account {
  let accountAddress = address.toHexString();
  let account = Account.load(accountAddress);

  if (account == null) {
    account = new Account(accountAddress);
    account.address = address;
    account.save();
  }

  return account as Account;
}

export function getOrCreateCollection(address: Address): Collection {
  let collectionId = address.toHexString();
  let collection = Collection.load(collectionId);
  if (!collection) {
    collection = new Collection(collectionId);
    collection.collectionAddress = address;

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
  collectionAddress: Bytes,
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

    let contract = dragoncore.bind(Address.fromBytes(collectionAddress));
    let callResult = contract.try_tokenURI(tokenId);
    if (!callResult.reverted) {
      collectible.descriptorUri = callResult.value;
      collectible.save();
    }
  }
  return collectible;
}
